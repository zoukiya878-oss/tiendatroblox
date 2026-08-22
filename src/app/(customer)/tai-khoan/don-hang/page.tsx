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

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Đã hoàn tiền",
};

export default async function DonHangPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan/don-hang");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đặt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Bạn chưa có đơn hàng nào
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/don-hang/${order.orderCode}`} className="text-primary hover:underline">
                    {order.orderCode}
                  </Link>
                </TableCell>
                <TableCell>{formatVnd(order.total)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{STATUS_LABEL[order.status] ?? order.status}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
