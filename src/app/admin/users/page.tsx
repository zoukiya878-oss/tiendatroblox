import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setUserWalletBalanceAction } from "./actions";
import type { Prisma } from "@prisma/client";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const where: Prisma.UserWhereInput = q
    ? { OR: [{ username: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, username: true, email: true, role: true, locked: true, createdAt: true, wallet: { select: { balance: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Người dùng</h1>
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="Tìm username hoặc email" className="w-64" />
        <Button type="submit">Tìm</Button>
      </form>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Số dư</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email ?? "—"}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Badge variant={u.locked ? "destructive" : "default"}>{u.locked ? "Đã khoá" : "Hoạt động"}</Badge>
                </TableCell>
                <TableCell>
                  <form action={setUserWalletBalanceAction.bind(null, u.id)} className="flex items-center gap-1.5">
                    <Input
                      name="balance"
                      type="number"
                      min={0}
                      step={1000}
                      defaultValue={(u.wallet?.balance ?? 0n).toString()}
                      className="h-8 w-28 text-xs"
                      title={formatVnd(u.wallet?.balance ?? 0n)}
                    />
                    <Button size="sm" variant="outline" type="submit" className="h-8 px-2 text-xs">
                      Lưu
                    </Button>
                  </form>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.createdAt.toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" render={<Link href={`/admin/users/${u.id}`} />}>
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
