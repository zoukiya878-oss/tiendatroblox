import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Prisma } from "@prisma/client";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string }>;
}) {
  const sp = await searchParams;
  const where: Prisma.AuditLogWhereInput = {};
  if (sp.action) where.action = { contains: sp.action, mode: "insensitive" };
  if (sp.entityType) where.entityType = { contains: sp.entityType, mode: "insensitive" };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { username: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Audit Logs</h1>

      <form className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Action</label>
          <Input name="action" defaultValue={sp.action} placeholder="VD: PRODUCT_UPDATE" className="w-56" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Entity type</label>
          <Input name="entityType" defaultValue={sp.entityType} placeholder="VD: Order" className="w-40" />
        </div>
        <Button type="submit">Lọc</Button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {log.createdAt.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>{log.actor?.username ?? "Hệ thống"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell>
                  <details>
                    <summary className="cursor-pointer text-xs text-primary">Xem JSON</summary>
                    <pre className="mt-1 max-w-md overflow-x-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify({ before: log.beforeData, after: log.afterData }, null, 2)}
                    </pre>
                  </details>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
