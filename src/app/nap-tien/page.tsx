import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const METHODS = [
  { href: "/nap-tien/ngan-hang", name: "Ngân hàng", desc: "Chuyển khoản qua ngân hàng" },
  { href: "/nap-tien/momo", name: "Momo", desc: "Nạp tiền qua ví Momo" },
  { href: "/nap-tien/thesieure", name: "TheSieuRe", desc: "Nạp tiền qua cổng TheSieuRe" },
  { href: "/nap-tien/the-cao", name: "Thẻ cào", desc: "Nạp bằng thẻ cào điện thoại" },
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
                <CardTitle>{m.name}</CardTitle>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
