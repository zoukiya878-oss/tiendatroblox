import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adjustWalletAction } from "./actions";

export default async function AdminWalletsPage() {
  const recent = await prisma.walletTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { username: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Ví</h1>

      <Card>
        <CardHeader>
          <CardTitle>Điều chỉnh ví thủ công</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={adjustWalletAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Username người dùng</Label>
              <Input id="username" name="username" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="direction">Loại điều chỉnh</Label>
              <select
                id="direction"
                name="direction"
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
              >
                <option value="credit">Cộng tiền (+)</option>
                <option value="debit">Trừ tiền (-)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Số tiền (VND)</Label>
              <Input id="amount" name="amount" type="number" min={1} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reason">Lý do (bắt buộc)</Label>
              <Input id="reason" name="reason" required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Thực hiện điều chỉnh</Button>
            </div>
          </form>
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
                <TableHead>User</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Số dư sau</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.user.username}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>{formatVnd(t.amount)}</TableCell>
                  <TableCell>{formatVnd(t.balanceAfter)}</TableCell>
                  <TableCell className="max-w-64 truncate">{t.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.createdAt.toLocaleString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
