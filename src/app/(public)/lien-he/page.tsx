import { Mail, Clock, Send, Landmark } from "lucide-react";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacebookIcon, ZaloIcon } from "@/components/icons/brand-icons";

export default async function ContactPage() {
  const s = await getSiteSettings();

  const channels = [
    { icon: Mail, label: "Email", value: s.supportEmail, href: s.supportEmail ? `mailto:${s.supportEmail}` : undefined },
    { icon: Clock, label: "Giờ hỗ trợ", value: s.supportHours },
    { icon: FacebookIcon, label: "Facebook", value: s.facebookUrl, href: s.facebookUrl },
    { icon: ZaloIcon, label: "Zalo", value: s.zaloUrl, href: s.zaloUrl },
    { icon: Send, label: "Telegram", value: s.telegramUrl, href: s.telegramUrl },
  ].filter((c) => c.value);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold">Liên hệ với chúng tôi</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {channels.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <c.icon className="size-4 text-primary" /> {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary">
                  {c.value}
                </a>
              ) : (
                <span className="text-sm font-medium">{c.value}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(s.bankName || s.bankAccountNumber) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" /> Thông tin chuyển khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {s.bankName && <span>Ngân hàng: <strong>{s.bankName}</strong></span>}
            {s.bankAccountNumber && <span>Số tài khoản: <strong>{s.bankAccountNumber}</strong></span>}
            {s.bankAccountName && <span>Chủ tài khoản: <strong>{s.bankAccountName}</strong></span>}
          </CardContent>
        </Card>
      )}

      {channels.length === 0 && (
        <p className="text-muted-foreground">Thông tin liên hệ đang được cập nhật.</p>
      )}
    </div>
  );
}
