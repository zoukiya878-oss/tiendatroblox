import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CouponForm } from "./coupon-form";
import { upsertCouponAction } from "./actions";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Mã giảm giá</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thêm coupon mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponForm action={upsertCouponAction.bind(null, null)} />
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Hạn dùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell>{c.type === "PERCENT" ? "%" : "Cố định"}</TableCell>
                <TableCell>{c.type === "PERCENT" ? `${c.value}%` : formatVnd(c.value)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.endAt ? c.endAt.toLocaleDateString("vi-VN") : "Không giới hạn"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Kích hoạt" : "Tắt"}</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" render={<Link href={`/admin/coupons/${c.id}`} />}>
                    Sửa
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
