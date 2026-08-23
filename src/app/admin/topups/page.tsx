import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { simulateTopupAction, manualApproveTopupAction } from "./actions";
import { ProviderIcon } from "@/components/payment/provider-icon";

export default async function AdminTopupsPage() {
  const topups = await prisma.topup.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { username: true } } },
  });

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Nạp tiền</h1>
      {isDev && (
        <p className="text-xs text-muted-foreground">
          Nút Simulate chỉ hiển thị ở môi trường development, dùng để giả lập webhook thanh toán.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Cổng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phí</TableHead>
              <TableHead>Thực nhận</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tạo lúc</TableHead>
              <TableHead>Hoàn tất</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topups.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.topupCode}</TableCell>
                <TableCell>{t.user.username}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ProviderIcon provider={t.provider} className="size-6" />
                    {t.provider}
                  </div>
                </TableCell>
                <TableCell>{formatVnd(t.amount)}</TableCell>
                <TableCell>{formatVnd(t.fee)}</TableCell>
                <TableCell>{formatVnd(t.netAmount)}</TableCell>
                <TableCell>
                  <Badge variant={t.status === "SUCCESS" ? "default" : t.status === "PENDING" ? "secondary" : "destructive"}>
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{t.createdAt.toLocaleString("vi-VN")}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t.completedAt ? t.completedAt.toLocaleString("vi-VN") : "-"}
                </TableCell>
                <TableCell>
                  {t.status === "PENDING" && (
                    <div className="flex flex-wrap gap-1">
                      {t.provider === "CARD" && (
                        <>
                          <form action={manualApproveTopupAction.bind(null, t.topupCode, true)}>
                            <Button size="sm" type="submit">
                              Duyệt tay
                            </Button>
                          </form>
                          <form action={manualApproveTopupAction.bind(null, t.topupCode, false)}>
                            <Button size="sm" variant="destructive" type="submit">
                              Từ chối
                            </Button>
                          </form>
                        </>
                      )}
                      {isDev && (
                        <>
                          <form action={simulateTopupAction.bind(null, t.topupCode, true)}>
                            <Button size="sm" variant="outline" type="submit">
                              Simulate Success
                            </Button>
                          </form>
                          <form action={simulateTopupAction.bind(null, t.topupCode, false)}>
                            <Button size="sm" variant="outline" type="submit">
                              Simulate Failed
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
