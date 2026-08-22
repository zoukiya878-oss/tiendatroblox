import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Wallet, ShoppingBag, Trophy } from "lucide-react";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { getRecentTopups, getRecentPurchases, getMonthlyLeaderboard } from "@/modules/cms/homepage-data";
import { getFeaturedProducts } from "@/modules/products/list-products";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function HomePage() {
  const [settings, categories, topups, purchases, leaderboard, featured] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getRecentTopups(8),
    getRecentPurchases(8),
    getMonthlyLeaderboard(10),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="flex flex-col gap-14 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h1 className="max-w-3xl text-balance font-heading text-3xl font-bold sm:text-5xl">
            {settings.heroTitle}
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground">{settings.heroDescription}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/vat-pham" />}>
              Mua ngay <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/nap-tien" />}>
              <Wallet /> Nạp tiền
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4">
          <h2 className="mb-4 font-heading text-xl font-bold">Danh mục dịch vụ</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/vat-pham?category=${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl bg-card p-4 text-center ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-primary/50"
              >
                <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {c.image ? (
                    <Image src={c.image} alt={c.name} fill className="object-cover" />
                  ) : (
                    <ShoppingBag className="size-6 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium group-hover:text-primary">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">🔥 Sản phẩm nổi bật</h2>
            <Link href="/vat-pham" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((p) => (
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
        </section>
      )}

      {/* Feeds + leaderboard */}
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" /> Giao dịch nạp gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {topups.length === 0 && <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>}
            {topups.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.username}</span>
                <span className="font-medium text-primary">+{formatVnd(t.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-primary" /> Đơn hàng vừa mua
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {purchases.length === 0 && <p className="text-sm text-muted-foreground">Chưa có đơn hàng nào.</p>}
            {purchases.map((p) => (
              <div key={p.id} className="flex flex-col text-sm">
                <span className="font-medium">{p.username}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {p.productName} ·{" "}
                  {formatDistanceToNow(p.createdAt, { addSuffix: true, locale: vi })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-accent" /> Bảng xếp hạng nạp tháng này
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {leaderboard.length === 0 && <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>}
            {leaderboard.map((l, i) => (
              <div key={l.userId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-5 text-center">{MEDALS[i] ?? `#${i + 1}`}</span>
                  {l.username}
                </span>
                <span className="flex items-center gap-1 font-medium text-accent">
                  <TrendingUp className="size-3" /> {formatVnd(l.total)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
