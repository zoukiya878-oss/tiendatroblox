import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { productImage } from "@/lib/image";
import { cayThueExtra } from "@/lib/cay-thue";
import { getCayThueServices } from "@/modules/cms/cay-thue-settings";
import { getOrCreateCart } from "@/modules/cart/cart-service";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutForm } from "./checkout-form";

type DisplayItem = { key: string; name: string; imageUrl: string | null; price: bigint; quantity: number };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ buyNow?: string; qty?: string; fields?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/dang-nhap?callbackUrl=/checkout");
  }

  const { buyNow, qty, fields } = await searchParams;
  const cayThueServices = await getCayThueServices();

  let buyNowCustomFields: Record<string, string> | undefined;
  if (fields) {
    try {
      buyNowCustomFields = JSON.parse(fields);
    } catch {
      buyNowCustomFields = undefined;
    }
  }

  let items: DisplayItem[];
  const hiddenFields: Record<string, string> = { mode: "cart" };

  if (buyNow) {
    const product = await prisma.product.findFirst({
      where: { id: buyNow, active: true },
      include: { images: true },
    });
    if (!product) redirect("/gio-hang");

    const quantity = Math.max(1, Number(qty ?? "1") || 1);
    items = [
      {
        key: product.id,
        name: product.name,
        imageUrl: product.images[0]?.url ?? null,
        price: product.price + cayThueExtra(buyNowCustomFields, cayThueServices),
        quantity,
      },
    ];
    hiddenFields.mode = "buyNow";
    hiddenFields.productId = product.id;
    hiddenFields.qty = String(quantity);
    if (fields) hiddenFields.fields = fields;
  } else {
    const cart = await getOrCreateCart();
    if (cart.items.length === 0) redirect("/gio-hang");
    items = cart.items.map((i) => ({
      key: i.id,
      name: i.product.name,
      imageUrl: i.product.images[0]?.url ?? null,
      price:
        i.product.price +
        cayThueExtra(i.customFields as Record<string, string> | null, cayThueServices),
      quantity: i.quantity,
    }));
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * BigInt(i.quantity), 0n);

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
  const walletBalance = wallet?.balance ?? 0n;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Thanh toán</h1>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={productImage(item.imageUrl, 120)} alt={item.name} className="size-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatVnd(item.price)} x {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatVnd(item.price * BigInt(item.quantity))}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <CheckoutForm hiddenFields={hiddenFields} subtotal={subtotal} walletBalance={walletBalance} />
    </div>
  );
}
