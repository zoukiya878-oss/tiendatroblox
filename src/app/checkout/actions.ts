"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { getOrCreateCart } from "@/modules/cart/cart-service";
import {
  createOrder,
  OutOfStockError,
  ValidationFailedError,
  InsufficientBalanceError,
  CouponError,
  type CheckoutItemInput,
} from "@/modules/orders/create-order";
import { validateAndComputeDiscount } from "@/modules/coupons/validate-coupon";

export type CheckoutState = {
  error?: string;
  couponCode?: string;
  discount?: string; // bigint serialized as string
};

async function resolveItems(formData: FormData): Promise<CheckoutItemInput[]> {
  const mode = String(formData.get("mode") ?? "cart");

  if (mode === "buyNow") {
    const productId = String(formData.get("productId") ?? "");
    const qty = Math.max(1, Number(formData.get("qty") ?? "1") || 1);
    const fieldsRaw = String(formData.get("fields") ?? "");
    let customFields: Record<string, string> | undefined;
    if (fieldsRaw) {
      try {
        customFields = JSON.parse(fieldsRaw);
      } catch {
        // ponytail: malformed fields payload -> ignore, createOrder will
        // reject the order if a required field ends up missing.
      }
    }
    return productId ? [{ productId, quantity: qty, customFields }] : [];
  }

  const cart = await getOrCreateCart();
  return cart.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    customFields: (i.customFields as Record<string, string> | null) ?? undefined,
  }));
}

async function computeSubtotal(items: CheckoutItemInput[]): Promise<bigint> {
  const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
  return items.reduce((sum, i) => {
    const p = products.find((p) => p.id === i.productId);
    return p ? sum + p.price * BigInt(i.quantity) : sum;
  }, 0n);
}

export async function previewCouponAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" };

  const couponCode = String(formData.get("couponCode") ?? "").trim();
  if (!couponCode) return {};

  const items = await resolveItems(formData);
  if (items.length === 0) return { error: "Không có sản phẩm để áp dụng mã" };

  try {
    const subtotal = await computeSubtotal(items);
    const { discount } = await validateAndComputeDiscount(prisma, {
      code: couponCode,
      userId: session.user.id,
      subtotal,
    });
    return { couponCode, discount: discount.toString() };
  } catch (err) {
    if (err instanceof CouponError) return { error: err.message, couponCode };
    throw err;
  }
}

export async function placeOrderAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" };

  const mode = String(formData.get("mode") ?? "cart");
  const couponCode = String(formData.get("couponCode") ?? "").trim() || undefined;
  const items = await resolveItems(formData);
  if (items.length === 0) return { error: "Không có sản phẩm để đặt hàng" };

  let order;
  try {
    order = await createOrder({ userId: session.user.id, items, couponCode });
  } catch (err) {
    if (err instanceof OutOfStockError) return { error: err.message };
    if (err instanceof ValidationFailedError) return { error: err.message || "Đơn hàng không hợp lệ" };
    if (err instanceof CouponError) return { error: err.message, couponCode };
    if (err instanceof InsufficientBalanceError) {
      const missing = err.required - err.balance;
      return {
        error: `Số dư: ${formatVnd(err.balance)} — Tổng: ${formatVnd(err.required)} — Thiếu: ${formatVnd(missing)}`,
        couponCode,
      };
    }
    throw err;
  }

  if (mode === "cart") {
    const cart = await getOrCreateCart();
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: { in: items.map((i) => i.productId) } },
    });
    revalidatePath("/gio-hang");
  }

  redirect(`/don-hang/${order.orderCode}`);
}
