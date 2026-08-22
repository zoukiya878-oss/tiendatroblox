import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoBar } from "@/components/layout/promo-bar";
import { AnnouncementPopup } from "@/components/layout/announcement-popup";
import { FloatingSupport } from "@/components/layout/floating-support";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { getActiveAnnouncement } from "@/modules/cms/announcement";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop Anh Robo - Vật phẩm game giá tốt",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
