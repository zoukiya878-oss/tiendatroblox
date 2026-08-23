"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(category?.image ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(!!category?.image);

  function setFile(file: File | null) {
    if (!file) return;
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
    }
    setPreview(URL.createObjectURL(file));
    setKeepExistingImage(false);
  }

  function removeImage() {
    setPreview(null);
    setKeepExistingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label>Ảnh danh mục</Label>
        {keepExistingImage && <input type="hidden" name="keepExistingImage" value="1" />}
        {preview ? (
          <div className="relative w-40">
            <img src={preview} alt="" className="aspect-square w-40 rounded-xl border border-border object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
              aria-label="Xoá ảnh"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="imageFile"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              setFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex w-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-8 text-center transition-colors",
              dragOver ? "border-primary bg-primary/10" : "border-input bg-background/50 hover:border-primary hover:bg-primary/5"
            )}
          >
            <ImagePlus className="size-6 text-muted-foreground" />
            <span className="text-xs font-medium">Kéo thả hoặc bấm chọn ảnh</span>
          </label>
        )}
        <Input
          ref={fileInputRef}
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
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
          className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring"
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
