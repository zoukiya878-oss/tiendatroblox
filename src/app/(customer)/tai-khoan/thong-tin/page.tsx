import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ThongTinPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan/thong-tin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true, createdAt: true, role: true },
  });
  if (!user) redirect("/dang-nhap");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Row label="Tên đăng nhập" value={user.username} />
        <Row label="Email" value={user.email ?? "Chưa cập nhật"} />
        <Row
          label="Ngày tạo tài khoản"
          value={new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(user.createdAt)}
        />
        <Row label="Vai trò" value={<Badge variant="secondary">{user.role}</Badge>} />
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
