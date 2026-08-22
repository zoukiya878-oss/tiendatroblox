import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "../blog-form";
import { upsertBlogPostAction } from "../actions";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Sửa bài viết: {post.title}</h1>
      <BlogForm action={upsertBlogPostAction.bind(null, id)} post={post} />
    </div>
  );
}
