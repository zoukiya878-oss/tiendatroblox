import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, PackageX } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/modules/products/get-product";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { ProductPurchaseForm } from "@/components/products/product-purchase-form";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Trang chủ</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/vat-pham?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card">
            {product.images[0] ? (
              <Image src={product.images[0].url} alt={product.images[0].alt ?? product.name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <PackageX className="size-10" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
                  <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-2xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="font-heading text-3xl font-bold text-primary">{formatVnd(product.price)}</span>
            {discount && (
              <>
                <span className="text-muted-foreground line-through">{formatVnd(product.compareAtPrice!)}</span>
                <Badge className="bg-accent text-accent-foreground">🔥 -{discount}%</Badge>
              </>
            )}
          </div>

          {product.stock > 0 ? (
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              Còn hàng: {product.stock}
            </Badge>
          ) : (
            <Badge variant="destructive" className="w-fit">
              HẾT HÀNG
            </Badge>
          )}

          {product.shortDescription && (
            <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          )}

          <ProductPurchaseForm productId={product.id} fields={product.fields} outOfStock={product.stock <= 0} />

          {product.description && (
            <div className="mt-4 whitespace-pre-line rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
              {product.description}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-heading text-xl font-bold">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {related.map((p) => (
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
        </section>
      )}
    </div>
  );
}
