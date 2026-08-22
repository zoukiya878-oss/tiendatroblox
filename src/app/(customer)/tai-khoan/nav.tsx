"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/tai-khoan/thong-tin", label: "Thông tin tài khoản" },
  { href: "/tai-khoan/doi-mat-khau", label: "Đổi mật khẩu" },
  { href: "/tai-khoan/vi", label: "Ví của tôi" },
  { href: "/tai-khoan/lich-su-giao-dich", label: "Lịch sử giao dịch" },
  { href: "/tai-khoan/don-hang", label: "Đơn hàng" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
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
