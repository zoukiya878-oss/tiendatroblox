import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Blog</h1>
        <Button render={<Link href="/admin/blog/new" />}>+ Thêm bài viết</Button>
      </div>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-64 truncate">{p.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.slug}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.publishedAt ? p.publishedAt.toLocaleDateString("vi-VN") : "-"}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" render={<Link href={`/admin/blog/${p.id}`} />}>
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
