import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    select: { id: true, username: true, email: true, role: true, locked: true, createdAt: true },
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
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Badge variant={u.locked ? "destructive" : "default"}>{u.locked ? "Đã khoá" : "Hoạt động"}</Badge>
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
