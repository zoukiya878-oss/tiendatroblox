import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "../refresh-button";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Đang chờ xử lý",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã huỷ",
  WRONG_VALUE: "Sai mệnh giá",
};

const FIELD_LABEL: Record<string, string> = {
  bankName: "Ngân hàng",
  bankCode: "Mã ngân hàng",
  accountNumber: "Số tài khoản",
  accountName: "Chủ tài khoản",
  transferContent: "Nội dung chuyển khoản",
  amount: "Số tiền",
  receiver: "Số nhận tiền",
  gateway: "Cổng thanh toán",
  orderId: "Mã đơn",
  cardProvider: "Nhà mạng",
  serial: "Số serial",
  cardCode: "Mã thẻ",
  note: "Ghi chú",
};

export default async function TopupResultPage({
  params,
}: {
  params: Promise<{ topupCode: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/dang-nhap?callbackUrl=/nap-tien");

  const { topupCode } = await params;
  const topup = await prisma.topup.findUnique({ where: { topupCode } });
  if (!topup || topup.userId !== session.user.id) notFound();

  const meta = (topup.meta as Record<string, string> | null) ?? {};
  const badgeVariant =
    topup.status === "SUCCESS" ? "default" : topup.status === "PENDING" ? "secondary" : "destructive";

  const qrUrl =
    meta.bankCode && meta.accountNumber
      ? `https://img.vietqr.io/image/${encodeURIComponent(meta.bankCode)}-${encodeURIComponent(meta.accountNumber)}-compact2.png?amount=${meta.amount}&addInfo=${encodeURIComponent(meta.transferContent ?? topup.topupCode)}&accountName=${encodeURIComponent(meta.accountName ?? "")}`
      : null;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mã nạp tiền {topup.topupCode}</span>
            <Badge variant={badgeVariant}>{STATUS_LABEL[topup.status] ?? topup.status}</Badge>
          </CardTitle>
          <CardDescription>Số tiền: {formatVnd(topup.amount)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {topup.status === "PENDING" && qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh động từ VietQR, không qua next/image optimize
            <img src={qrUrl} alt="QR chuyển khoản" className="mx-auto size-56 rounded-lg border border-border" />
          )}
          {topup.status === "PENDING" && !qrUrl && (
            <div className="mx-auto flex size-40 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-center text-xs text-muted-foreground">
              Chưa cấu hình STK ngân hàng
              <br />
              (Admin → Cài đặt)
            </div>
          )}

          <div className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm">
            {Object.entries(meta).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{FIELD_LABEL[key] ?? key}</span>
                <span className="text-right font-medium break-all">{String(value)}</span>
              </div>
            ))}
          </div>

          {topup.status === "PENDING" && <RefreshButton />}
        </CardContent>
      </Card>
    </div>
  );
}
