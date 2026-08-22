import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const CART_COOKIE = "cart_session_id";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: { product: { include: { images: true } } },
  },
} as const;

type CartOwner = { userId: string } | { sessionId: string };

async function getCartOwner(): Promise<CartOwner> {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (userId) return { userId };

  const jar = await cookies();
  let sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    try {
      jar.set(CART_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {
      // ponytail: cookies() is read-only during RSC render; the cookie gets
      // set for real on the next Server Action / route handler call.
    }
  }
  return { sessionId };
}

/** Read-only — never creates a cart row, safe to call on every page render (header badge). */
export async function getCartItemCount(): Promise<number> {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;

  if (!userId && !sessionId) return 0;

  const where = userId ? { userId } : { sessionId };
  const cart = await prisma.cart.findFirst({
    where,
    select: { items: { select: { quantity: true } } },
  });
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export async function getOrCreateCart() {
  const owner = await getCartOwner();
  const where = "userId" in owner ? { userId: owner.userId } : { sessionId: owner.sessionId };

  const existing = await prisma.cart.findFirst({ where, include: cartInclude });
  if (existing) return existing;

  return prisma.cart.create({ data: where, include: cartInclude });
}

export async function addToCart(input: {
  productId: string;
  quantity: number;
  customFields?: Record<string, string>;
}) {
  const { productId, quantity, customFields } = input;
  if (quantity <= 0) throw new Error("Số lượng không hợp lệ");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) throw new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");

  const cart = await getOrCreateCart();
  const existingItem = cart.items.find((i) => i.productId === productId);

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        ...(customFields ? { customFields } : {}),
      },
    });
    return;
  }

  await prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity, customFields: customFields ?? undefined },
  });
}

async function assertOwnsItem(cartItemId: string) {
  const cart = await getOrCreateCart();
  const item = cart.items.find((i) => i.id === cartItemId);
  if (!item) throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  return item;
}

export async function updateQuantity(cartItemId: string, quantity: number) {
  await assertOwnsItem(cartItemId);
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return;
  }
  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
}

export async function removeItem(cartItemId: string) {
  await assertOwnsItem(cartItemId);
  await prisma.cartItem.delete({ where: { id: cartItemId } });
}

export function getCartTotal(cart: { items: { quantity: number; product: { price: bigint } }[] }): bigint {
  return cart.items.reduce((sum, i) => sum + i.product.price * BigInt(i.quantity), 0n);
}

/** Moves CartItems from the anonymous (cookie) cart into the user's cart. Call on login. */
export async function mergeAnonymousCartIntoUser(userId: string) {
  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) return;

  const anonCart = await prisma.cart.findUnique({ where: { sessionId }, include: { items: true } });
  if (!anonCart || anonCart.items.length === 0) {
    if (anonCart) await prisma.cart.delete({ where: { id: anonCart.id } });
    return;
  }

  const userCart =
    (await prisma.cart.findFirst({ where: { userId } })) ??
    (await prisma.cart.create({ data: { userId } }));

  for (const item of anonCart.items) {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: userCart.id, productId: item.productId },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { cartId: userCart.id } });
    }
  }

  await prisma.cart.delete({ where: { id: anonCart.id } }).catch(() => {});
}
