"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@prisma/client";

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

export function BlogForm({ action, post }: { action: (formData: FormData) => void; post?: BlogPost }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
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
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excerpt">Tóm tắt</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} />
      </div>
      {/* ponytail: textarea, nâng cấp TipTap nếu cần rich text thật */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Nội dung</Label>
        <Textarea id="content" name="content" rows={10} required defaultValue={post?.content ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="thumbnailFile">Ảnh thumbnail</Label>
        <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
        <input type="hidden" name="existingThumbnail" value={post?.thumbnail ?? ""} />
        {post?.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt="thumbnail" className="h-24 w-24 rounded object-cover" />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Trạng thái</Label>
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "DRAFT"}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
          >
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seoTitle">SEO Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seoDescription">SEO Description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription ?? ""} />
        </div>
      </div>
      <div>
        <SubmitButton label={post ? "Lưu thay đổi" : "Tạo bài viết"} />
      </div>
    </form>
  );
}
