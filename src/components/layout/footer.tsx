import Link from "next/link";
import { Send, Mail, Clock } from "lucide-react";
import type { SiteSettings } from "@/modules/cms/site-settings";
import { FacebookIcon, ZaloIcon, YoutubeIcon } from "@/components/icons/brand-icons";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="font-heading text-lg font-bold">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {settings.siteName}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Vật phẩm game giá tốt, giao dịch tức thì, uy tín hàng đầu.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Liên kết</span>
          <Link href="/vat-pham" className="text-muted-foreground hover:text-foreground">Vật phẩm</Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link>
          <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          <Link href="/check-back" className="text-muted-foreground hover:text-foreground">Check Back</Link>
          <Link href="/chinh-sach-bao-mat" className="text-muted-foreground hover:text-foreground">Chính sách quyền riêng tư</Link>
          <Link href="/xoa-du-lieu" className="text-muted-foreground hover:text-foreground">Xóa dữ liệu</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Hỗ trợ</span>
          {settings.supportEmail && (
            <a href={`mailto:${settings.supportEmail}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Mail className="size-3.5" /> {settings.supportEmail}
            </a>
          )}
          {settings.supportHours && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" /> {settings.supportHours}
            </span>
          )}
          <div className="mt-1 flex items-center gap-3">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:opacity-80">
                <FacebookIcon className="size-5" />
              </a>
            )}
            {settings.zaloUrl && (
              <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer" className="text-[#0068FF] hover:opacity-80">
                <ZaloIcon className="size-5" />
              </a>
            )}
            {settings.telegramUrl && (
              <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Send className="size-4" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:opacity-80">
                <YoutubeIcon className="size-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings.siteName}. Đã đăng ký bản quyền.
      </div>
    </footer>
  );
}
