"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImagePlus } from "lucide-react";
import type { DeliveryType, Product, ProductField, ProductFieldType, ProductImage } from "@prisma/client";

type FieldRow = {
  label: string;
  key: string;
  type: ProductFieldType;
  required: boolean;
  placeholder: string;
  options: string;
  sortOrder: number;
};

type ImageRow = { url: string; alt: string; sortOrder: number };

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

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => void;
  categories: { id: string; name: string }[];
  product?: Product & { images: ProductImage[]; fields: ProductField[] };
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);

  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((i) => ({ url: i.url, alt: i.alt ?? "", sortOrder: i.sortOrder })) ?? []
  );
  const [fields, setFields] = useState<FieldRow[]>(
    product?.fields.map((f) => ({
      label: f.label,
      key: f.key,
      type: f.type,
      required: f.required,
      placeholder: f.placeholder ?? "",
      options: f.options ?? "",
      sortOrder: f.sortOrder,
    })) ?? []
  );

  const imagesInputRef = useRef<HTMLInputElement>(null);
  const fieldsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imagesInputRef.current) imagesInputRef.current.value = JSON.stringify(images);
  }, [images]);
  useEffect(() => {
    if (fieldsInputRef.current) fieldsInputRef.current.value = JSON.stringify(fields);
  }, [fields]);

  function addImageUrl() {
    const url = prompt("Nhập URL ảnh:");
    if (url) setImages((prev) => [...prev, { url, alt: "", sortOrder: prev.length }]);
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { label: "", key: "", type: "TEXT", required: false, placeholder: "", options: "", sortOrder: prev.length },
    ]);
  }

  function addAccountPasswordFields() {
    setFields((prev) => [
      ...prev,
      { label: "Tài khoản", key: "tai-khoan", type: "TEXT", required: true, placeholder: "Nhập tài khoản", options: "", sortOrder: prev.length },
      { label: "Mật khẩu", key: "mat-khau", type: "TEXT", required: true, placeholder: "Nhập mật khẩu", options: "", sortOrder: prev.length + 1 },
    ]);
  }

  function addIngameUsernameField() {
    setFields((prev) => [
      ...prev,
      { label: "Tên nhân vật Roblox (Username)", key: "username-ingame", type: "TEXT", required: true, placeholder: "Nhập username Roblox", options: "", sortOrder: prev.length },
    ]);
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Tên sản phẩm</Label>
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
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Mã sản phẩm (code)</Label>
          <Input id="code" name="code" required defaultValue={product?.code} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Danh mục</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option value="" disabled>
              -- Chọn danh mục --
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Giá (VND)</Label>
          <Input id="price" name="price" type="number" min={0} required defaultValue={product ? Number(product.price) : undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compareAtPrice">Giá gạch (so sánh, không bắt buộc)</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            min={0}
            defaultValue={product?.compareAtPrice ? Number(product.compareAtPrice) : undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stock">Tồn kho</Label>
          <Input id="stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryType">Kiểu giao hàng</Label>
          <select
            id="deliveryType"
            name="deliveryType"
            defaultValue={product?.deliveryType ?? "INSTANT"}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
          >
            <option value="INSTANT">Giao ngay (INSTANT)</option>
            <option value="MANUAL">Giao thủ công (MANUAL)</option>
            <option value="HOLD">Giữ hàng (HOLD)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="holdDays">Số ngày giữ hàng (nếu HOLD)</Label>
          <Input id="holdDays" name="holdDays" type="number" min={0} defaultValue={product?.holdDays ?? undefined} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shortDescription">Mô tả ngắn</Label>
        <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={product?.shortDescription ?? ""} />
      </div>

      {/* ponytail: textarea, nâng cấp TipTap nếu cần rich text thật */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea id="description" name="description" rows={6} defaultValue={product?.description ?? ""} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Hình ảnh sản phẩm</Label>
          <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
            + Thêm bằng URL
          </Button>
        </div>

        <label
          htmlFor="imageFiles"
          className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input bg-background/50 px-4 py-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <ImagePlus className="size-7 text-muted-foreground" />
          <span className="text-sm font-medium">Bấm để chọn ảnh (chọn nhiều được)</span>
          <span className="text-xs text-muted-foreground">Ảnh sẽ được đẩy lên khi bấm Lưu</span>
        </label>
        <Input id="imageFiles" type="file" name="imageFiles" multiple accept="image/*" className="hidden" />
        <input type="hidden" name="imagesJson" ref={imagesInputRef} />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((img, idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                <img src={img.url} alt={img.alt} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Xoá
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-primary/90 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                    Ảnh chính
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Trường thông tin động (Product Fields)</Label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addIngameUsernameField}>
              + Username Ingame
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addAccountPasswordFields}>
              + Tài khoản/Mật khẩu
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addField}>
              + Thêm trường
            </Button>
          </div>
        </div>
        <input type="hidden" name="fieldsJson" ref={fieldsInputRef} />
        {fields.map((f, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 md:grid-cols-6">
            <Input
              placeholder="Label"
              value={f.label}
              onChange={(e) => setFields((prev) => prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))}
            />
            <Input
              placeholder="Key"
              value={f.key}
              onChange={(e) => setFields((prev) => prev.map((r, i) => (i === idx ? { ...r, key: e.target.value } : r)))}
            />
            <select
              value={f.type}
              onChange={(e) =>
                setFields((prev) => prev.map((r, i) => (i === idx ? { ...r, type: e.target.value as ProductFieldType } : r)))
              }
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              <option value="TEXT">TEXT</option>
              <option value="NUMBER">NUMBER</option>
              <option value="SELECT">SELECT</option>
              <option value="TEXTAREA">TEXTAREA</option>
            </select>
            <Input
              placeholder="Placeholder"
              value={f.placeholder}
              onChange={(e) => setFields((prev) => prev.map((r, i) => (i === idx ? { ...r, placeholder: e.target.value } : r)))}
            />
            <Input
              placeholder="Options (a,b,c) nếu SELECT"
              value={f.options}
              onChange={(e) => setFields((prev) => prev.map((r, i) => (i === idx ? { ...r, options: e.target.value } : r)))}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={f.required}
                onCheckedChange={(v) => setFields((prev) => prev.map((r, i) => (i === idx ? { ...r, required: v } : r)))}
              />
              <span className="text-xs text-muted-foreground">Bắt buộc</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))}
              >
                Xoá
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seoTitle">SEO Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seoDescription">SEO Description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={product?.seoDescription ?? ""} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch name="featured" defaultChecked={product?.featured} />
          Nổi bật
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch name="active" defaultChecked={product?.active ?? true} />
          Đang bán (active)
        </label>
      </div>

      <div>
        <SubmitButton label={product ? "Lưu thay đổi" : "Tạo sản phẩm"} />
      </div>
    </form>
  );
}
