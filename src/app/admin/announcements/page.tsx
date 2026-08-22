import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertAnnouncementAction, deleteAnnouncementAction } from "./actions";

function toDateInputValue(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function AdminAnnouncementsPage() {
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Thông báo</h1>
      <p className="text-xs text-muted-foreground">
        Dữ liệu này hiển thị ở Announcement Popup và Promotion Bar trên trang khách hàng.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Thêm thông báo mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertAnnouncementAction.bind(null, null)} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctaLabel">Nút CTA (nhãn)</Label>
              <Input id="ctaLabel" name="ctaLabel" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea id="content" name="content" rows={3} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctaUrl">Link CTA</Label>
              <Input id="ctaUrl" name="ctaUrl" />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startAt">Bắt đầu</Label>
                <Input id="startAt" name="startAt" type="date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endAt">Kết thúc</Label>
                <Input id="endAt" name="endAt" type="date" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked /> Kích hoạt
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Thêm</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {items.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{a.title}</span>
                <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Kích hoạt" : "Tắt"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{a.content}</p>
              <details>
                <summary className="cursor-pointer text-sm text-primary">Sửa</summary>
                <form action={upsertAnnouncementAction.bind(null, a.id)} className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Input name="title" defaultValue={a.title} required />
                  <Input name="ctaLabel" defaultValue={a.ctaLabel ?? ""} />
                  <Textarea name="content" rows={3} defaultValue={a.content} required className="md:col-span-2" />
                  <Input name="ctaUrl" defaultValue={a.ctaUrl ?? ""} />
                  <div className="flex gap-3">
                    <Input name="startAt" type="date" defaultValue={toDateInputValue(a.startAt)} />
                    <Input name="endAt" type="date" defaultValue={toDateInputValue(a.endAt)} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" defaultChecked={a.active} /> Kích hoạt
                  </label>
                  <div>
                    <Button type="submit" size="sm">
                      Lưu
                    </Button>
                  </div>
                </form>
              </details>
              <form action={deleteAnnouncementAction.bind(null, a.id)}>
                <Button type="submit" variant="destructive" size="sm">
                  Xoá
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
