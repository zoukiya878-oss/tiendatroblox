"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

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
      <div className="mb-4 font-heading text-lg font-semibold">Shop Anh Robo Admin</div>
      <NavLinks />
    </aside>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border bg-card p-3 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" size="icon" />}>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Shop Anh Robo Admin</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
