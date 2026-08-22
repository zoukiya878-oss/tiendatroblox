import { getSiteSettings } from "@/modules/cms/site-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteSettingsAction } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

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
              <Label htmlFor="supportHours">Giờ hỗ trợ</Label>
              <Input id="supportHours" name="supportHours" defaultValue={settings.supportHours} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankName">Tên ngân hàng</Label>
              <Input id="bankName" name="bankName" defaultValue={settings.bankName} />
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
    </div>
  );
}
