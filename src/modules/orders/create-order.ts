import { prisma } from "@/lib/prisma";
import { debitWallet, InsufficientBalanceError } from "@/modules/wallets/wallet-service";
import { validateAndComputeDiscount, CouponError } from "@/modules/coupons/validate-coupon";
import { generateOrderCode } from "./order-code";

export class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`${productName} đã hết hàng`);
  }
}

export class ValidationFailedError extends Error {}

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  customFields?: Record<string, string>;
}

export interface CheckoutInput {
  userId: string;
  items: CheckoutItemInput[];
  couponCode?: string;
}

export { InsufficientBalanceError, CouponError };

export async function createOrder(input: CheckoutInput) {
  const { userId, items, couponCode } = input;
  if (items.length === 0) throw new ValidationFailedError("Giỏ hàng trống");

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      include: { fields: true },
    });

    let subtotal = 0n;
    const itemSnapshots: {
      productId: string;
      productCode: string;
      productName: string;
      unitPrice: bigint;
      quantity: number;
      subtotal: bigint;
      fields: { fieldKey: string; fieldLabel: string; value: string }[];
    }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.active) {
        throw new ValidationFailedError("Sản phẩm không còn khả dụng");
      }
      if (item.quantity <= 0) throw new ValidationFailedError("Số lượng không hợp lệ");

      const isAccountProduct = !!product.accountUsername;
      if (isAccountProduct && item.quantity !== 1) {
        throw new ValidationFailedError("Sản phẩm tài khoản chỉ mua được 1");
      }

      for (const field of product.fields) {
        if (field.required) {
          const value = item.customFields?.[field.key];
          if (!value || !value.trim()) {
            throw new ValidationFailedError(`Thiếu thông tin bắt buộc: ${field.label}`);
          }
        }
      }

      const stockUpdate = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
      });
      if (stockUpdate.count === 0) throw new OutOfStockError(product.name);

      const lineSubtotal = product.price * BigInt(item.quantity);
      subtotal += lineSubtotal;

      const fieldSnapshots = product.fields.map((f) => ({
        fieldKey: f.key,
        fieldLabel: f.label,
        value: item.customFields?.[f.key] ?? "",
      }));
      if (isAccountProduct) {
        // Giao credentials của acc vào đơn — hiển thị luôn ở trang đơn hàng đã mua.
        fieldSnapshots.push(
          { fieldKey: "account_username", fieldLabel: "Tài khoản", value: product.accountUsername ?? "" },
          { fieldKey: "account_password", fieldLabel: "Mật khẩu", value: product.accountPassword ?? "" },
        );
        // Ẩn khỏi web, giữ lại trong admin ở trạng thái đã bán.
        await tx.product.update({
          where: { id: product.id },
          data: { active: false, soldAt: new Date() },
        });
      }

      itemSnapshots.push({
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        fields: fieldSnapshots,
      });
    }

    let discount = 0n;
    let couponId: string | undefined;
    if (couponCode) {
      const result = await validateAndComputeDiscount(tx, { code: couponCode, userId, subtotal });
      discount = result.discount;
      couponId = result.couponId;
    }

    const total = subtotal - discount;

    const order = await tx.order.create({
      data: {
        orderCode: generateOrderCode(),
        userId,
        subtotal,
        discount,
        total,
        couponCode,
        couponId,
        status: "PAID",
        completedAt: new Date(),
        items: {
          create: itemSnapshots.map((s) => ({
            productId: s.productId,
            productCode: s.productCode,
            productName: s.productName,
            unitPrice: s.unitPrice,
            quantity: s.quantity,
            subtotal: s.subtotal,
            fields: { create: s.fields },
          })),
        },
        statusHistory: {
          create: { toStatus: "PAID", note: "Thanh toán qua ví" },
        },
      },
    });

    if (couponId) {
      await tx.couponUsage.create({ data: { couponId, userId, orderId: order.id } });
    }

    await debitWallet(tx, {
      userId,
      amount: total,
      type: "PURCHASE",
      referenceType: "ORDER",
      referenceId: order.id,
      description: `Thanh toán đơn hàng ${order.orderCode}`,
    });

    return order;
  });
}
