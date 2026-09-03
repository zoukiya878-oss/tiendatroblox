import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { CAY_THUE_FIELD_KEY, formatCayThuePicked } from "@/lib/cay-thue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Đã hoàn tiền",
};

export default async function DonHangDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const session = await auth();
  const { orderCode } = await params;
  if (!session?.user) redirect(`/dang-nhap?callbackUrl=/don-hang/${orderCode}`);

  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: {
      items: { include: { fields: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();
  if (order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Đơn hàng {order.orderCode}</CardTitle>
          <Badge variant="outline">{STATUS_LABEL[order.status] ?? order.status}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <SummaryRow label="Tạm tính" value={formatVnd(order.subtotal)} />
          {order.discount > 0n && (
            <SummaryRow label="Giảm giá" value={`-${formatVnd(order.discount)}`} />
          )}
          <Separator />
          <SummaryRow label="Tổng cộng" value={formatVnd(order.total)} bold />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.productName}</span>
                <span className="text-sm text-muted-foreground">
                  {item.quantity} x {formatVnd(item.unitPrice)} = {formatVnd(item.subtotal)}
                </span>
              </div>
              {item.fields.length > 0 && (
                <div className="grid gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                  {item.fields.map((field) => (
                    <div key={field.id} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{field.fieldLabel}</span>
                      <span className="whitespace-pre-line text-right font-medium">
                        {field.fieldKey === CAY_THUE_FIELD_KEY
                          ? formatCayThuePicked(field.value)
                          : field.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-4">
            {order.statusHistory.map((h) => (
              <li key={h.id} className="flex gap-3">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">{STATUS_LABEL[h.toStatus] ?? h.toStatus}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
                      h.createdAt
                    )}
                    {h.note ? ` — ${h.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "text-base font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
