import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getBlogBySlug } from "@/modules/cms/blog";

// ponytail: no HTML sanitizer installed — strip tags to safe plain text instead of
// dangerouslySetInnerHTML. Upgrade to isomorphic-dompurify if rich formatting is required.
function htmlToPlainText(html: string): string {
  return html
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">{post.title}</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{post.author.username}</span>
        {post.publishedAt && <span>· {format(post.publishedAt, "dd/MM/yyyy")}</span>}
      </div>

      {post.thumbnail && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {htmlToPlainText(post.content)}
      </div>
    </article>
  );
}
