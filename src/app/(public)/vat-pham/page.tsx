import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listProducts, type ProductSort } from "@/modules/products/list-products";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "name_asc", label: "Tên A-Z" },
  { value: "best_selling", label: "Bán chạy" },
];

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;

  const categorySlug = get("category");
  const subSlug = get("sub");
  const sort = (get("sort") as ProductSort) || "newest";
  const page = get("page") ? Number(get("page")) : 1;

  const categories = await prisma.category.findMany({ where: { active: true } });
  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;
  const children = category ? categories.filter((c) => c.parentId === category.id) : [];
  const activeSub = subSlug ? children.find((c) => c.slug === subSlug) : undefined;

  // "Dịch vụ" cha có danh mục con: bấm "Tất cả" gộp sản phẩm mọi con, bấm 1
  // thẻ con thì lọc đúng con đó. Danh mục không có con (hoặc không chọn gì)
  // thì lọc thẳng theo category.id như cũ.
  const effectiveCategoryId = activeSub ? activeSub.id : children.length === 0 ? category?.id : undefined;
  const effectiveCategoryIds = !activeSub && children.length > 0 ? children.map((c) => c.id) : undefined;

  const productCounts =
    children.length > 0
      ? Object.fromEntries(
          await Promise.all(
            children.map(async (c) => [c.id, await prisma.product.count({ where: { categoryId: c.id, active: true } })])
          )
        )
      : {};
  const totalInService = children.length > 0 ? Object.values(productCounts).reduce((a: number, b) => a + (b as number), 0) : 0;

  const { items, total, totalPages } = await listProducts({
    categoryId: effectiveCategoryId,
    categoryIds: effectiveCategoryIds,
    sort,
    page,
    pageSize: 12,
  });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { category: categorySlug, sub: subSlug, sort, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 font-heading text-2xl font-bold">
        {activeSub ? activeSub.name : category ? category.name : "Tất cả vật phẩm"}
      </h1>
      {category?.description && !activeSub && (
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
      )}

      {children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={`/vat-pham?category=${category!.slug}`}
            className={cn(
              "flex min-w-32 flex-col gap-1 rounded-xl px-4 py-3 ring-1 transition-colors",
              !activeSub ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-foreground/10 hover:ring-primary/40"
            )}
          >
            <span className="font-semibold">Tất cả</span>
            <span className="text-xs opacity-80">{totalInService} vật phẩm đang bán</span>
          </Link>
          {children.map((c) => (
            <Link
              key={c.id}
              href={`/vat-pham?category=${category!.slug}&sub=${c.slug}`}
              className={cn(
                "flex min-w-32 flex-col gap-1 rounded-xl px-4 py-3 ring-1 transition-colors",
                activeSub?.id === c.id
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-foreground/10 hover:ring-primary/40"
              )}
            >
              <span className="font-semibold">{c.name}</span>
              <span className="text-xs opacity-80">{productCounts[c.id] ?? 0} vật phẩm đang bán</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{total} sản phẩm</span>
        <form method="GET" action="/vat-pham" className="flex items-center gap-2">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          {subSlug && <input type="hidden" name="sub" value={subSlug} />}
          <label className="text-xs text-muted-foreground">Sắp xếp:</label>
          <select
            name="sort"
            defaultValue={sort}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="submit" className="h-8 rounded-lg bg-secondary px-3 text-sm hover:bg-secondary/80">
            OK
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              stock={p.stock}
              imageUrl={p.images[0]?.url}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={buildQuery({ page: String(page - 1) })} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <PaginationItem key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 ? <span className="px-1 text-muted-foreground">…</span> : null}
                  <PaginationLink href={buildQuery({ page: String(p) })} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={buildQuery({ page: String(page + 1) })} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
