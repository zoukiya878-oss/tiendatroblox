import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Sản phẩm/danh mục/blog mới phải vào sitemap ngay, không được cache tĩnh
// (Next.js 16 cache route này mặc định — đã từng bug thật: tạo sản phẩm mới
// không hiện trong sitemap.xml dù DB đã có).
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || "https://tiendatroblox.store";

  const [products, categories, posts] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vat-pham`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/faq`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/lien-he`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/nap-tien`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/vat-pham/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/vat-pham?category=${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
