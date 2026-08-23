import { getSiteSettings } from "@/modules/cms/site-settings";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateSiteSettingsAction, updatePaymentIntegrationSettingsAction } from "./actions";

export default async function AdminSettingsPage() {
  const [settings, integrations] = await Promise.all([getSiteSettings(), getPaymentIntegrationSettings()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Cài đặt</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin website</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSiteSettingsAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="siteName">Tên website</Label>
              <Input id="siteName" name="siteName" defaultValue={settings.siteName} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supportEmail">Email hỗ trợ</Label>
              <Input id="supportEmail" name="supportEmail" defaultValue={settings.supportEmail} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="heroTitle">Tiêu đề trang chủ (hero)</Label>
              <Input id="heroTitle" name="heroTitle" defaultValue={settings.heroTitle} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="heroDescription">Mô tả trang chủ (hero)</Label>
              <Textarea id="heroDescription" name="heroDescription" rows={2} defaultValue={settings.heroDescription} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zaloUrl">Zalo URL</Label>
              <Input id="zaloUrl" name="zaloUrl" defaultValue={settings.zaloUrl} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telegramUrl">Telegram URL</Label>
              <Input id="telegramUrl" name="telegramUrl" defaultValue={settings.telegramUrl} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="youtubeUrl">Youtube URL</Label>
              <Input id="youtubeUrl" name="youtubeUrl" defaultValue={settings.youtubeUrl} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supportHours">Giờ hỗ trợ</Label>
              <Input id="supportHours" name="supportHours" defaultValue={settings.supportHours} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankName">Tên ngân hàng</Label>
              <Input id="bankName" name="bankName" defaultValue={settings.bankName} placeholder="MB Bank" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankCode">Mã ngân hàng (VietQR)</Label>
              <Input
                id="bankCode"
                name="bankCode"
                defaultValue={settings.bankCode}
                placeholder="VD: MB, VCB, TCB, ICB..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankAccountNumber">Số tài khoản</Label>
              <Input id="bankAccountNumber" name="bankAccountNumber" defaultValue={settings.bankAccountNumber} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="bankAccountName">Tên chủ tài khoản</Label>
              <Input id="bankAccountName" name="bankAccountName" defaultValue={settings.bankAccountName} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Lưu cài đặt</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tích hợp thẻ cào — gachthefast.com</CardTitle>
          <CardDescription>
            Vào gachthefast.com → mục &quot;Kết nối API&quot; để lấy API Key. Key được lưu riêng, không hiện ở trang
            khách. Chưa nhập key thì thẻ cào vẫn tạo được nhưng phải admin duyệt tay ở /admin/topups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePaymentIntegrationSettingsAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gachthefastApiKey">API Key</Label>
              <Input
                id="gachthefastApiKey"
                name="gachthefastApiKey"
                type="password"
                autoComplete="off"
                placeholder={integrations.gachthefastApiKey ? "•••••••• (đã lưu, để trống = giữ nguyên)" : "Dán API Key vào đây"}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gachthefastPartnerId">Partner ID / Merchant ID (nếu có)</Label>
              <Input
                id="gachthefastPartnerId"
                name="gachthefastPartnerId"
                autoComplete="off"
                defaultValue={integrations.gachthefastPartnerId}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Lưu API Key</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chuyển khoản tự động cộng ví (Casso)</CardTitle>
          <CardDescription>
            Đăng ký free tại casso.vn → liên kết tài khoản ngân hàng → tạo Webhook mới (chọn kiểu V2), dán đúng
            &quot;Đường dẫn nhận dữ liệu&quot; và &quot;Security Key&quot; bên dưới vào Casso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePaymentIntegrationSettingsAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankAutoProvider">Dịch vụ</Label>
              <select
                id="bankAutoProvider"
                name="bankAutoProvider"
                defaultValue={integrations.bankAutoProvider}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                <option value="">— Chưa bật —</option>
                <option value="casso">Casso.vn</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankAutoApiKey">API Key Casso (không bắt buộc, chỉ cần nếu tự đối soát thêm)</Label>
              <Input
                id="bankAutoApiKey"
                name="bankAutoApiKey"
                type="password"
                autoComplete="off"
                placeholder={integrations.bankAutoApiKey ? "•••••••• (đã lưu, để trống = giữ nguyên)" : "Dán API Key"}
              />
            </div>

            {integrations.bankAutoWebhookToken ? (
              <div className="flex flex-col gap-2 rounded-lg bg-muted p-3 text-sm md:col-span-2">
                <div>
                  <span className="text-muted-foreground">Đường dẫn nhận dữ liệu (Webhook URL): </span>
                  <code className="break-all">{(process.env.APP_URL || "https://<domain-cua-ban>") + "/api/webhooks/casso"}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Security Key: </span>
                  <code>{integrations.bankAutoWebhookToken}</code>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground md:col-span-2">
                Chọn dịch vụ rồi bấm Lưu — hệ thống tự sinh Webhook URL + Security Key để bạn dán vào Casso.
              </p>
            )}

            <div className="md:col-span-2">
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
