"use server";

import { addToCart } from "@/modules/cart/cart-service";

export async function addToCartAction(input: {
  productId: string;
  quantity: number;
  customFields: Record<string, string>;
}) {
  await addToCart(input);
}
