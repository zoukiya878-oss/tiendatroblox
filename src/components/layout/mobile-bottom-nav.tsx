"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu as MenuIcon,
  ListChecks,
  X,
  Home,
  Wallet,
  ShoppingBag,
  Newspaper,
  HelpCircle,
  Phone,
  Search,
  User,
  Receipt,
} from "lucide-react";
import type { SiteSettings } from "@/modules/cms/site-settings";
import { HeaderSignOutButton } from "@/components/layout/header-sign-out-button";
import { formatVnd } from "@/lib/money";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/nap-tien", label: "Nạp tiền", icon: Wallet },
  { href: "/vat-pham", label: "Vật phẩm", icon: ShoppingBag },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/lien-he", label: "Liên hệ", icon: Phone },
  { href: "/check-back", label: "Check Back", icon: Search },
  { href: "/tai-khoan/thong-tin", label: "Tài khoản", icon: User },
  { href: "/tai-khoan/don-hang", label: "Đơn hàng", icon: ListChecks },
  { href: "/tai-khoan/lich-su-giao-dich", label: "Giao dịch", icon: Receipt },
];

// ponytail: same hand-rolled toggle pattern as AdminMobileNav (no Sheet/Dialog
// primitive) — keeps this critical nav element free of any headless-UI
// trigger-composition surface.
export function MobileBottomNav({
  settings,
  user,
  walletBalance,
}: {
  settings: SiteSettings;
  user: { name?: string | null } | null;
  walletBalance: bigint;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground"
          >
            <MenuIcon className="size-5" />
            <span className="text-[11px] font-medium">Menu</span>
          </button>

          <Link href="/nap-tien" className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground">
            <Wallet className="size-5" />
            <span className="text-[11px] font-medium">Nạp tiền</span>
          </Link>

          <Link href="/" className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-pink text-white shadow-lg shadow-primary/40 ring-4 ring-card">
              <Home className="size-6" />
            </span>
            <span className="text-[11px] font-bold text-foreground">Trang chủ</span>
          </Link>

          <Link href="/lien-he" className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground">
            <Phone className="size-5" />
            <span className="text-[11px] font-medium">Liên hệ</span>
          </Link>

          {user ? (
            <Link
              href="/tai-khoan/don-hang"
              className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground"
            >
              <ListChecks className="size-5" />
              <span className="text-[11px] font-medium">Đơn hàng</span>
            </Link>
          ) : (
            <Link
              href="/dang-nhap"
              className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground"
            >
              <User className="size-5" />
              <span className="text-[11px] font-medium">Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>

      {/* spacer so page content isn't hidden behind the fixed bar */}
      <div className="h-20 lg:hidden" aria-hidden />

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-card p-4 shadow-xl lg:hidden">
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg font-bold">{settings.siteName}</span>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            {user ? (
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">Số dư ví: {formatVnd(walletBalance)}</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/dang-nhap"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-gradient-to-r from-primary to-brand-pink py-2 text-center text-sm font-medium text-white"
                >
                  Đăng ký
                </Link>
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <l.icon className="size-4 shrink-0" />
                  {l.label}
                </Link>
              ))}
              {user && (
                <div onClick={() => setOpen(false)}>
                  <HeaderSignOutButton />
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
