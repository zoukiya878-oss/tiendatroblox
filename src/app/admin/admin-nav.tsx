"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  MenuIcon,
  XIcon,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Wallet,
  CreditCard,
  Ticket,
  Newspaper,
  HelpCircle,
  Megaphone,
  Settings,
  Landmark,
  ScrollText,
  Percent,
  Gamepad2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/cay-thue", label: "Quản lý cày thuê", icon: Gamepad2 },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/wallets", label: "Ví", icon: Wallet },
  { href: "/admin/topups", label: "Nạp tiền", icon: CreditCard },
  { href: "/admin/card-discounts", label: "Chiết khấu thẻ cào", icon: Percent },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/faqs", label: "FAQ", icon: HelpCircle },
  { href: "/admin/announcements", label: "Thông báo", icon: Megaphone },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
  { href: "/admin/payment-providers", label: "Payment Providers", icon: Landmark },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
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
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
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
