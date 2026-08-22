import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROVIDERS: { kind: string; label: string }[] = [
  { kind: "BANK", label: "Chuyển khoản ngân hàng" },
  { kind: "MOMO", label: "Ví MoMo" },
  { kind: "THESIEURE", label: "Thẻ siêu rẻ" },
  { kind: "CARD", label: "Thẻ cào" },
];

export default function AdminPaymentProvidersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Payment Providers</h1>
      <p className="text-sm text-muted-foreground">
        Danh sách cổng thanh toán hiện tại đang chạy ở chế độ mock (giả lập), chưa kết nối gateway thật. Cấu hình thật sẽ
        được bổ sung ở milestone sau.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROVIDERS.map((p) => (
          <Card key={p.kind}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{p.label}</CardTitle>
              <Badge variant="secondary">Mock mode</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Kind: <span className="font-mono">{p.kind}</span> · Trạng thái: đang hoạt động (mock)
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
