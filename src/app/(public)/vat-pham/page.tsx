import { prisma } from "@/lib/prisma";
import { listProducts, type ProductSort } from "@/modules/products/list-products";
import { ProductCard } from "@/components/products/product-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { DeliveryType } from "@prisma/client";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "name_asc", label: "Tên A-Z" },
  { value: "best_selling", label: "Bán chạy" },
];

const DELIVERY_LABELS: Record<DeliveryType, string> = {
  INSTANT: "Giao ngay",
  MANUAL: "Giao thủ công",
  HOLD: "Giữ hàng",
};

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;

  const categorySlug = get("category");
  const q = get("q");
  const minPrice = get("minPrice") ? Number(get("minPrice")) : undefined;
  const maxPrice = get("maxPrice") ? Number(get("maxPrice")) : undefined;
  const deliveryType = get("deliveryType") as DeliveryType | undefined;
  const inStockOnly = get("inStockOnly") === "1";
  const sort = (get("sort") as ProductSort) || "newest";
  const page = get("page") ? Number(get("page")) : 1;

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;

  const { items, total, totalPages } = await listProducts({
    categoryId: category?.id,
    q,
    minPrice,
    maxPrice,
    deliveryType,
    inStockOnly,
    sort,
    page,
    pageSize: 12,
  });

  function buildQuery(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { category: categorySlug, q, minPrice: get("minPrice"), maxPrice: get("maxPrice"), deliveryType, inStockOnly: get("inStockOnly"), sort, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold">
        {category ? category.name : "Tất cả vật phẩm"}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <form className="flex h-fit flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10" method="GET" action="/vat-pham">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tìm kiếm</label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Tên sản phẩm..."
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Danh mục</label>
            <select
              name="category"
              defaultValue={categorySlug ?? ""}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Khoảng giá (đ)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                defaultValue={get("minPrice")}
                placeholder="Từ"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
              />
              <input
                type="number"
                name="maxPrice"
                defaultValue={get("maxPrice")}
                placeholder="Đến"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hình thức giao</label>
            <select
              name="deliveryType"
              defaultValue={deliveryType ?? ""}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
            >
              <option value="">Tất cả</option>
              {Object.entries(DELIVERY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="inStockOnly" value="1" defaultChecked={inStockOnly} className="size-4 accent-primary" />
            Chỉ hiện còn hàng
          </label>

          <input type="hidden" name="sort" value={sort} />
          <button
            type="submit"
            className="h-8 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Áp dụng
          </button>
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{total} sản phẩm</span>
            <form method="GET" action="/vat-pham" className="flex items-center gap-2">
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {q && <input type="hidden" name="q" value={q} />}
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
      </div>
    </div>
  );
}
