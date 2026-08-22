"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/wallets", label: "Ví" },
  { href: "/admin/topups", label: "Nạp tiền" },
  { href: "/admin/coupons", label: "Mã giảm giá" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/announcements", label: "Thông báo" },
  { href: "/admin/settings", label: "Cài đặt" },
  { href: "/admin/payment-providers", label: "Payment Providers" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card p-4 md:block">
      <div className="mb-4 font-heading text-lg font-semibold">Tiendatroblox Admin</div>
      <NavLinks />
    </aside>
  );
}

// ponytail: plain useState toggle + fixed div instead of the Dialog/Portal-based
// Sheet component — the base-ui trigger's touch handling was unreliable inside
// Facebook Messenger's in-app WebView, a hand-rolled onClick has no such surface.
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card p-3 md:hidden">
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full border border-border bg-background active:scale-95"
      >
        <MenuIcon className="size-4.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg font-semibold">Tiendatroblox Admin</span>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
