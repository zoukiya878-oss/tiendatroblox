import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

// Nút nổi góc trái (kiểu widget Zalo/FB) — chỉ hiện cho admin, mở admin panel.
export function FloatingAdmin() {
  return (
    <Link
      href="/admin"
      aria-label="Admin panel"
      className="fixed bottom-24 left-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/25 transition-transform hover:scale-105 md:bottom-5"
    >
      <LayoutDashboard className="size-5" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  );
}
