import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProviderIcon } from "@/components/payment/provider-icon";

const METHODS = [
  { href: "/nap-tien/ngan-hang", name: "Ngân hàng", desc: "Chuyển khoản qua ngân hàng", provider: "BANK" },
  { href: "/nap-tien/momo", name: "Momo", desc: "Nạp tiền qua ví Momo", provider: "MOMO" },
  { href: "/nap-tien/thesieure", name: "TheSieuRe", desc: "Nạp tiền qua cổng TheSieuRe", provider: "THESIEURE" },
  { href: "/nap-tien/the-cao", name: "Thẻ cào", desc: "Nạp bằng thẻ cào điện thoại", provider: "CARD" },
];

export default async function NapTienPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/dang-nhap?callbackUrl=/nap-tien");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Nạp tiền vào ví</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {METHODS.map((m) => (
          <Link key={m.href} href={m.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={m.provider} className="size-10" />
                  <div>
                    <CardTitle>{m.name}</CardTitle>
                    <CardDescription>{m.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
