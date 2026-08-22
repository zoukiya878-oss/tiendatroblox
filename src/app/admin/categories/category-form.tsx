"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@prisma/client";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : label}
    </Button>
  );
}

export function CategoryForm({
  action,
  category,
  parentOptions = [],
}: {
  action: (formData: FormData) => void;
  category?: Category;
  parentOptions?: { id: string; name: string }[];
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!category);

  return (
    <form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Tên danh mục</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">URL ảnh</Label>
        <Input id="image" name="image" defaultValue={category?.image ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="parentId">Danh mục cha (để trống = dịch vụ cấp 1)</Label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">— Không có (danh mục cấp 1) —</option>
          {parentOptions
            .filter((p) => p.id !== category?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={category?.description ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch name="active" defaultChecked={category?.active ?? true} />
        Hiển thị (active)
      </label>
      <div className="md:col-span-2">
        <SubmitButton label={category ? "Lưu thay đổi" : "Tạo danh mục"} />
      </div>
    </form>
  );
}
