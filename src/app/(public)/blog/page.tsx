import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getPublishedBlogPosts } from "@/modules/cms/blog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const { items, totalPages } = await getPublishedBlogPosts(page);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold">Blog</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block">
            <Card size="sm" className="overflow-hidden">
              {post.thumbnail && (
                <div className="relative aspect-video w-full">
                  <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2">
                <span className="line-clamp-2 font-medium">{post.title}</span>
                {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                {post.publishedAt && (
                  <span className="text-xs text-muted-foreground">{format(post.publishedAt, "dd/MM/yyyy")}</span>
                )}
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${page - 1}`} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href={`?page=${p}`} isActive={p === page}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${page + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
