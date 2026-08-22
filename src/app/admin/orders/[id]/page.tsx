import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { changeOrderStatusAction, cancelOrderAction, refundOrderAction } from "../actions";
import type { OrderStatus } from "@prisma/client";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Đã hoàn tiền",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { fields: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  const canRefund = order.status !== "REFUNDED" && order.status !== "CANCELLED";
  const canCancel = order.status !== "CANCELLED" && order.status !== "REFUNDED" && order.status !== "COMPLETED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Đơn hàng {order.orderCode}</h1>
        <Badge>{STATUS_LABEL[order.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.productName}</span>
                    <span>{formatVnd(item.subtotal)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Mã: {item.productCode} · SL: {item.quantity} · Đơn giá: {formatVnd(item.unitPrice)}
                  </div>
                  {item.fields.length > 0 && (
                    <ul className="mt-2 text-xs text-muted-foreground">
                      {item.fields.map((f) => (
                        <li key={f.id}>
                          {f.fieldLabel}: {f.value}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <Separator />
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <span>-{formatVnd(order.discount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span>{formatVnd(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {order.statusHistory.map((h) => (
                  <li key={h.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span>
                      {h.fromStatus ? `${STATUS_LABEL[h.fromStatus]} → ` : ""}
                      {STATUS_LABEL[h.toStatus]}
                      {h.note ? ` — ${h.note}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{h.createdAt.toLocaleString("vi-VN")}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div>{order.user.username}</div>
              <div className="text-muted-foreground">{order.user.email}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đổi trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={changeOrderStatusAction.bind(null, order.id)} className="flex flex-col gap-2">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <Input name="note" placeholder="Ghi chú (không bắt buộc)" />
                <Button type="submit" size="sm">
                  Cập nhật trạng thái
                </Button>
              </form>
            </CardContent>
          </Card>

          {canCancel && (
            <Card>
              <CardHeader>
                <CardTitle>Huỷ đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={cancelOrderAction.bind(null, order.id)} className="flex flex-col gap-2">
                  <Input name="note" placeholder="Lý do huỷ (không bắt buộc)" />
                  <Button type="submit" variant="destructive" size="sm">
                    Huỷ đơn hàng
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {canRefund && (
            <Card>
              <CardHeader>
                <CardTitle>Hoàn tiền</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={refundOrderAction.bind(null, order.id)} className="flex flex-col gap-2">
                  <Input name="reason" placeholder="Lý do hoàn tiền (bắt buộc)" required />
                  <Button type="submit" variant="destructive" size="sm">
                    Hoàn {formatVnd(order.total)} vào ví
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
