import { format } from "date-fns";
import { Search, PackageSearch } from "lucide-react";
import { lookupOrder } from "@/modules/orders/lookup-order";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

export default async function CheckBackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const order = code ? await lookupOrder(code.trim()) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 flex items-center gap-2 font-heading text-2xl font-bold">
        <PackageSearch className="size-6 text-primary" /> Tra cứu đơn hàng
      </h1>
      <p className="mb-6 text-muted-foreground">Nhập mã đơn hàng để kiểm tra trạng thái giao hàng và bảo hành.</p>

      <form method="GET" action="/check-back" className="flex gap-2">
        <input
          type="text"
          name="code"
          defaultValue={code}
          placeholder="Nhập mã đơn hàng, VD: DH123456"
          className="h-9 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
        />
        <button type="submit" className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          <Search className="size-4" /> Tra cứu
        </button>
      </form>

      {code && !order && (
        <p className="mt-6 text-sm text-destructive">Không tìm thấy đơn hàng với mã &quot;{code}&quot;.</p>
      )}

      {order && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold">{order.orderCode}</span>
            <Badge>{STATUS_LABELS[order.status] ?? order.status}</Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            Ngày mua: {format(order.createdAt, "dd/MM/yyyy HH:mm")}
          </span>
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.productName} x{item.quantity}</span>
                <span className="font-medium">{formatVnd(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 font-medium">
            <span>Tổng tiền</span>
            <span className="text-primary">{formatVnd(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
