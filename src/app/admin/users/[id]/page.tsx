import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleUserLockAction, changeUserRoleAction } from "../actions";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      wallet: true,
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      walletTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
    // passwordHash is intentionally not excluded from `select` here since we use `include`
    // with the full model — never render user.passwordHash below.
  });
  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">{user.username}</h1>
        <Badge variant={user.locked ? "destructive" : "default"}>{user.locked ? "Đã khoá" : "Hoạt động"}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>Email: {user.email ?? "—"}</div>
            <div>Vai trò: {user.role}</div>
            <div>Số dư ví: {formatVnd(user.wallet?.balance ?? 0n)}</div>
            <div>Ngày tạo: {user.createdAt.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khoá / Mở khoá</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={toggleUserLockAction.bind(null, user.id, !user.locked)}>
              <Button type="submit" variant={user.locked ? "default" : "destructive"} size="sm">
                {user.locked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đổi vai trò</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={changeUserRoleAction.bind(null, user.id)} className="flex gap-2">
              <select
                name="role"
                defaultValue={user.role}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="STAFF">STAFF</option>
                <option value="SUPPORT">SUPPORT</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
              <Button type="submit" size="sm">
                Lưu
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.orderCode}</TableCell>
                  <TableCell>{formatVnd(o.total)}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.createdAt.toLocaleDateString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Giao dịch ví gần đây</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Số dư sau</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.walletTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>{formatVnd(t.amount)}</TableCell>
                  <TableCell>{formatVnd(t.balanceAfter)}</TableCell>
                  <TableCell className="max-w-48 truncate">{t.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.createdAt.toLocaleDateString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
