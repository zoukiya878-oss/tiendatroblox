import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const TYPE_LABEL: Record<string, string> = {
  TOPUP: "Nạp tiền",
  PURCHASE: "Thanh toán",
  REFUND: "Hoàn tiền",
  ADMIN_ADJUSTMENT: "Điều chỉnh",
  BONUS: "Thưởng",
};

export default async function LichSuGiaoDichPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan/lich-su-giao-dich");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.walletTransaction.count({ where: { userId: session.user.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử giao dịch</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Số dư sau</TableHead>
              <TableHead>Mô tả</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Chưa có giao dịch nào
                </TableCell>
              </TableRow>
            )}
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap">
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
                    t.createdAt
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{TYPE_LABEL[t.type] ?? t.type}</Badge>
                </TableCell>
                <TableCell className={t.amount < 0n ? "text-destructive" : "text-primary"}>
                  {t.amount < 0n ? "-" : "+"}
                  {formatVnd(t.amount < 0n ? -t.amount : t.amount)}
                </TableCell>
                <TableCell>{formatVnd(t.balanceAfter)}</TableCell>
                <TableCell className="text-muted-foreground">{t.description ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              nativeButton={false}
              render={<Link href={`?page=${page - 1}`} />}
            >
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              nativeButton={false}
              render={<Link href={`?page=${page + 1}`} />}
            >
              Sau
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
