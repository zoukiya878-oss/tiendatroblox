import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoBar } from "@/components/layout/promo-bar";
import { AnnouncementPopup } from "@/components/layout/announcement-popup";
import { FloatingSupport } from "@/components/layout/floating-support";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { getActiveAnnouncement } from "@/modules/cms/announcement";
import { Toaster } from "@/components/ui/sonner";

// ponytail: gaming-styled, bolder body font with Vietnamese diacritics support
// (Orbitron-style display fonts drop Vietnamese glyphs, so we go heavy-weight
// sans instead — Exo 2/Rajdhani vibe via weight + tracking, not the font pick).
const bodyFont = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
  const [settings, announcement] = await Promise.all([
    getSiteSettings(),
    getActiveAnnouncement(),
  ]);

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${geistMono.variable} h-full antialiased`}
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
        <PromoBar />
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <FloatingSupport settings={settings} />
        {announcement && <AnnouncementPopup announcement={announcement} />}
        <Toaster />
      </body>
    </html>
  );
}
