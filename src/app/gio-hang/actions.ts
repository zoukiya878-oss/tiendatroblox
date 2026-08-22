"use server";

import { revalidatePath } from "next/cache";
import { updateQuantity, removeItem } from "@/modules/cart/cart-service";

export async function updateQuantityAction(cartItemId: string, quantity: number) {
  await updateQuantity(cartItemId, quantity);
  revalidatePath("/gio-hang");
}

export async function removeItemAction(cartItemId: string) {
  await removeItem(cartItemId);
  revalidatePath("/gio-hang");
}
