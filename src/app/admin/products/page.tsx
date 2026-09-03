import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Prisma } from "@prisma/client";
import { productImage } from "@/lib/image";
import { duplicateProductAction, toggleProductActiveAction } from "./actions";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
          { accountUsername: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Sản phẩm</h1>
        <Button render={<Link href="/admin/products/new" />}>+ Thêm sản phẩm</Button>
      </div>
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="Tìm theo tên, code, tài khoản" className="w-72" />
        <Button type="submit" variant="outline">Tìm</Button>
      </form>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn</TableHead>
              <TableHead>Đã bán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={productImage(p.images[0].url, 80)} alt={p.name} className="size-10 rounded object-contain" />
                  ) : (
                    <div className="size-10 rounded bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell className="max-w-48 truncate">{p.name}</TableCell>
                <TableCell>{p.category.name}</TableCell>
                <TableCell>{formatVnd(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.soldCount}</TableCell>
                <TableCell>
                  {p.soldAt ? (
                    <Badge variant="secondary">Đã bán</Badge>
                  ) : (
                    <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Đang bán" : "Đã ẩn"}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.createdAt.toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" render={<Link href={`/admin/products/${p.id}`} />}>
                      Sửa
                    </Button>
                    <form action={duplicateProductAction.bind(null, p.id)}>
                      <Button size="sm" variant="outline" type="submit">
                        Nhân bản
                      </Button>
                    </form>
                    <form action={toggleProductActiveAction.bind(null, p.id, !p.active)}>
                      <Button size="sm" variant={p.active ? "destructive" : "default"} type="submit">
                        {p.active ? "Ẩn" : "Kích hoạt"}
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
