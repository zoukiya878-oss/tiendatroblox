import { BlogForm } from "../blog-form";
import { upsertBlogPostAction } from "../actions";

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Thêm bài viết</h1>
      <BlogForm action={upsertBlogPostAction.bind(null, null)} />
    </div>
  );
}
