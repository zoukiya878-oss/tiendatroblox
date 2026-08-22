import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 9;

export async function getPublishedBlogPosts(page = 1) {
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { items, total, page: Math.max(1, page), pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getBlogBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { username: true } } },
  });
}
