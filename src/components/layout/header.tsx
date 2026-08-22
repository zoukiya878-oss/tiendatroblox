import Link from "next/link";
import { ShoppingCart, Wallet, Coins, ChevronDown, User, Package, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import type { SiteSettings } from "@/modules/cms/site-settings";
import { getCartItemCount } from "@/modules/cart/cart-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeaderSignOutItem } from "@/components/layout/header-sign-out-item";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/vat-pham", label: "Vật phẩm" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/lien-he", label: "Liên hệ" },
  { href: "/check-back", label: "Check Back" },
];

export async function Header({ settings }: { settings: SiteSettings }) {
  const session = await auth();

  const [categories, cartCount] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    getCartItemCount(),
  ]);

  const wallet = session?.user?.id
    ? await prisma.wallet.findUnique({ where: { userId: session.user.id }, select: { balance: true } })
    : null;

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-xl font-black">
            <span className="bg-gradient-to-r from-primary via-brand-pink to-accent bg-clip-text text-transparent">
              {settings.siteName}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" nativeButton={false} render={<Link href={link.href} />}>
                {link.label}
              </Button>
            ))}
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="sm">
                      Dịch vụ <ChevronDown className="size-3.5" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start">
                  {categories.map((c) => (
                    <DropdownMenuItem key={c.id} render={<Link href={`/vat-pham?category=${c.slug}`} />}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="relative rounded-full"
              nativeButton={false}
              render={<Link href="/gio-hang" aria-label="Giỏ hàng" />}
            >
              <ShoppingCart className="size-4" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-brand-pink px-1 text-[10px] text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Button>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="secondary"
                      size="sm"
                      className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 sm:inline-flex"
                    >
                      <Coins className="size-3.5" />
                      {formatVnd(wallet?.balance ?? 0n)}
                      <ChevronDown className="size-3.5" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/tai-khoan/thong-tin" />}>
                    <User /> Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/tai-khoan/don-hang" />}>
                    <Package /> Đơn hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/tai-khoan/lich-su-giao-dich" />}>
                    <Receipt /> Giao dịch
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/nap-tien" />}>
                    <Wallet /> Nạp tiền
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <HeaderSignOutItem />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dang-nhap" />}>
                  Đăng nhập
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-brand-pink text-white hover:opacity-90"
                  nativeButton={false}
                  render={<Link href="/dang-ky" />}
                >
                  Đăng ký
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
