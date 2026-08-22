"use client";

import { usePathname } from "next/navigation";

/** Hides the storefront chrome (header/footer/floating buttons) on /admin —
 * the admin panel has its own separate sidebar/mobile-nav shell, and having
 * both stacked was causing overlapping fixed/sticky hamburger triggers that
 * ate taps on mobile. */
export function ShopChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
