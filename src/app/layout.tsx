import type { Metadata } from "next";
import { Be_Vietnam_Pro, Baloo_2, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoBar } from "@/components/layout/promo-bar";
import { AnnouncementPopup } from "@/components/layout/announcement-popup";
import { FloatingSupport } from "@/components/layout/floating-support";
import { FloatingAdmin } from "@/components/layout/floating-admin";
import { ShopChromeGate } from "@/components/layout/shop-chrome-gate";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { getActiveAnnouncement } from "@/modules/cms/announcement";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ponytail: gaming-styled, bolder body font with Vietnamese diacritics support
// (Orbitron-style display fonts drop Vietnamese glyphs, so we go heavy-weight
// sans instead — Exo 2/Rajdhani vibe via weight + tracking, not the font pick).
const bodyFont = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Rounded, chunky display font for headings/CTAs — reads more "gaming" than
// the body sans while still carrying Vietnamese diacritics correctly.
const headingFont = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiendatroblox - Vật phẩm game giá tốt",
  description: "Mua bán vật phẩm game uy tín, giao dịch tức thì, hỗ trợ 24/7.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, announcement, session] = await Promise.all([
    getSiteSettings(),
    getActiveAnnouncement(),
    auth(),
  ]);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const wallet = session?.user?.id
    ? await prisma.wallet.findUnique({ where: { userId: session.user.id }, select: { balance: true } })
    : null;

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headingFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ponytail: inline script (no next-themes dep) — sets the class before
            paint so switching themes doesn't flash the wrong palette. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ShopChromeGate>
          <PromoBar />
          <Header settings={settings} />
        </ShopChromeGate>
        <main className="flex-1">{children}</main>
        <ShopChromeGate>
          <Footer settings={settings} />
          <FloatingSupport settings={settings} />
          {isAdmin && <FloatingAdmin />}
          {announcement && <AnnouncementPopup announcement={announcement} />}
          <MobileBottomNav settings={settings} user={session?.user ?? null} walletBalance={wallet?.balance ?? 0n} />
        </ShopChromeGate>
        <Toaster />
      </body>
    </html>
  );
}
