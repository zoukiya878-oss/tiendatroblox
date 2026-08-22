import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ViPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan/vi");

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ví của tôi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
          <p className="text-3xl font-semibold">{formatVnd(wallet?.balance ?? 0n)}</p>
        </div>
        <Button nativeButton={false} render={<Link href="/nap-tien" />}>
          Nạp tiền
        </Button>
      </CardContent>
    </Card>
  );
}
