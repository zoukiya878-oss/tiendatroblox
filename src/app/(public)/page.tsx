import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Wallet, ShoppingBag, Trophy } from "lucide-react";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { getRecentTopups, getRecentPurchases, getMonthlyLeaderboard } from "@/modules/cms/homepage-data";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollToButton } from "@/components/scroll-to-button";
import { ProviderIcon } from "@/components/payment/provider-icon";
import { TrustStats } from "@/components/layout/trust-stats";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function HomePage() {
  const [settings, categories, topups, purchases, leaderboard] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({ where: { active: true, parentId: null }, orderBy: { sortOrder: "asc" } }),
    getRecentTopups(8),
    getRecentPurchases(8),
    getMonthlyLeaderboard(10),
  ]);

  return (
    <div className="flex flex-col gap-14 pb-16">
      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/10 px-6 py-14 sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-pink/20 blur-3xl"
          />

          <Image
            src="/logo-banner.gif"
            alt=""
            aria-hidden
            unoptimized
            width={500}
            height={229}
            className="pointer-events-none absolute top-1/2 right-8 hidden w-96 -translate-y-1/2 rounded-2xl object-contain opacity-90 drop-shadow-2xl lg:block xl:w-[30rem]"
          />

          <div className="relative flex flex-col gap-6 lg:max-w-xl">
            <span className="w-fit rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-bold tracking-widest text-accent uppercase">
              Shop game giá rẻ
            </span>

            <h1 className="max-w-2xl text-balance font-heading text-4xl leading-[1.1] font-black sm:text-6xl">
              <span className="bg-gradient-to-r from-primary via-brand-pink to-accent bg-clip-text text-transparent">
                {settings.heroTitle}
              </span>
            </h1>

            <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
              {settings.heroDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ScrollToButton
                targetId="dich-vu-noi-bat"
                size="lg"
                className="bg-gradient-to-r from-primary to-brand-pink text-white hover:opacity-90"
              >
                Mua ngay <ArrowRight />
              </ScrollToButton>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/nap-tien" />}>
                <Wallet /> Nạp tiền
              </Button>
            </div>
          </div>
        </div>
      </section>

      <TrustStats />

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
                  <Image src={c.image || "/service-placeholder.png"} alt={c.name} fill className="object-cover" />
                </div>
                <span className="text-sm font-medium group-hover:text-primary">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dịch vụ nổi bật — bìa danh mục, bấm vào ra danh sách sản phẩm của danh mục đó */}
      {categories.length > 0 && (
        <section id="dich-vu-noi-bat" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">🔥 Dịch vụ nổi bật</h2>
            <Link href="/vat-pham" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/vat-pham?category=${c.slug}`}
                className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-transform hover:-translate-y-1"
              >
                <Image
                  src={c.image || "/service-placeholder.png"}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="relative z-10 flex flex-col gap-1 p-4">
                  <h3 className="font-heading text-lg font-bold text-white">{c.name}</h3>
                  {c.description && (
                    <p className="line-clamp-2 text-xs text-white/80">{c.description}</p>
                  )}
                  <span className="mt-1 text-xs font-semibold text-accent">Xem tất cả →</span>
                </div>
              </Link>
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
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <ProviderIcon provider={t.provider} />
                <div className="flex flex-1 flex-col">
                  <span className="text-muted-foreground">{t.username} nạp thành công</span>
                  <span className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(t.createdAt, { addSuffix: true, locale: vi })}
                  </span>
                </div>
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
