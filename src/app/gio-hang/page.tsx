import Link from "next/link";
import { getOrCreateCart, getCartTotal } from "@/modules/cart/cart-service";
import { getCayThueServices } from "@/modules/cms/cay-thue-settings";
import { cayThueExtra } from "@/lib/cay-thue";
import { formatVnd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartItemRow } from "./cart-item-row";

export default async function CartPage() {
  const cart = await getOrCreateCart();
  const cayThueServices = await getCayThueServices();
  const total = getCartTotal(cart, cayThueServices);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-semibold">Giỏ hàng trống</h1>
        <p className="mb-6 text-muted-foreground">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Button render={<Link href="/" />}>Tiếp tục mua sắm</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Giỏ hàng</h1>

      <Card>
        <CardContent>
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              id={item.id}
              name={item.product.name}
              imageUrl={item.product.images[0]?.url ?? null}
              price={
                item.product.price +
                cayThueExtra(item.customFields as Record<string, string> | null, cayThueServices)
              }
              quantity={item.quantity}
            />
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold">Tổng cộng: {formatVnd(total)}</span>
        <Button size="lg" render={<Link href="/checkout" />}>
          Tiến hành thanh toán
        </Button>
      </div>
    </div>
  );
}
