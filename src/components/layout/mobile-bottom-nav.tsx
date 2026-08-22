"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu as MenuIcon, Wallet, ListChecks, X } from "lucide-react";
import type { SiteSettings } from "@/modules/cms/site-settings";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/vat-pham", label: "Vật phẩm" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/lien-he", label: "Liên hệ" },
  { href: "/check-back", label: "Check Back" },
  { href: "/tai-khoan/thong-tin", label: "Tài khoản" },
  { href: "/tai-khoan/don-hang", label: "Đơn hàng" },
  { href: "/tai-khoan/lich-su-giao-dich", label: "Giao dịch" },
];

// ponytail: same hand-rolled toggle pattern as AdminMobileNav (no Sheet/Dialog
// primitive) — keeps this critical nav element free of any headless-UI
// trigger-composition surface.
export function MobileBottomNav({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground"
          >
            <MenuIcon className="size-5" />
            <span className="text-xs font-medium">Menu</span>
          </button>

          <Link
            href="/nap-tien"
            className="mx-2 flex flex-[1.3] flex-col items-center gap-0.5 rounded-2xl bg-gradient-to-r from-primary to-brand-pink py-2.5 text-white shadow-lg shadow-primary/30"
          >
            <Wallet className="size-5" />
            <span className="text-xs font-bold">Nạp tiền</span>
          </Link>

          <Link
            href="/tai-khoan/don-hang"
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground"
          >
            <ListChecks className="size-5" />
            <span className="text-xs font-medium">Đơn hàng</span>
          </Link>
        </div>
      </nav>

      {/* spacer so page content isn't hidden behind the fixed bar */}
      <div className="h-20 md:hidden" aria-hidden />

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} aria-hidden />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-card p-4 shadow-xl md:hidden">
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
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
