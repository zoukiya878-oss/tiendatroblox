import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertFaqAction, deleteFaqAction } from "./actions";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">FAQ</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thêm câu hỏi mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertFaqAction.bind(null, null)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="question">Câu hỏi</Label>
              <Input id="question" name="question" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="answer">Câu trả lời</Label>
              <Textarea id="answer" name="answer" rows={3} required />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sortOrder">Thứ tự</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} className="w-24" />
              </div>
              <Button type="submit">Thêm</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {faqs.map((f) => (
          <Card key={f.id}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.question}</span>
                <Badge variant={f.active ? "default" : "secondary"}>{f.active ? "Hiển thị" : "Ẩn"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{f.answer}</p>
              <details>
                <summary className="cursor-pointer text-sm text-primary">Sửa</summary>
                <form action={upsertFaqAction.bind(null, f.id)} className="mt-2 flex flex-col gap-2">
                  <Input name="question" defaultValue={f.question} required />
                  <Textarea name="answer" rows={3} defaultValue={f.answer} required />
                  <div className="flex items-center gap-3">
                    <Input name="sortOrder" type="number" defaultValue={f.sortOrder} className="w-24" />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="active" defaultChecked={f.active} /> Hiển thị
                    </label>
                    <Button type="submit" size="sm">
                      Lưu
                    </Button>
                  </div>
                </form>
              </details>
              <form action={deleteFaqAction.bind(null, f.id)}>
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
