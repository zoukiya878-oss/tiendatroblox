import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryForm } from "./category-form";
import { upsertCategoryAction, toggleCategoryActiveAction } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } }, parent: { select: { name: true } } },
  });
  const parentOptions = categories.filter((c) => !c.parentId).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Danh mục</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thêm danh mục mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm action={upsertCategoryAction.bind(null, null)} parentOptions={parentOptions} />
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Số sản phẩm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.parent ? `— ${c.name}` : c.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.sortOrder}</TableCell>
                <TableCell>{c._count.products}</TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Hiển thị" : "Đã ẩn"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" render={<Link href={`/admin/categories/${c.id}`} />}>
                      Sửa
                    </Button>
                    <form action={toggleCategoryActiveAction.bind(null, c.id, !c.active)}>
                      <Button size="sm" variant={c.active ? "destructive" : "default"} type="submit">
                        {c.active ? "Ẩn" : "Kích hoạt"}
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
