import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../category-form";
import { upsertCategoryAction } from "../actions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  const parentOptions = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Sửa danh mục: {category.name}</h1>
      <CategoryForm action={upsertCategoryAction.bind(null, id)} category={category} parentOptions={parentOptions} />
    </div>
  );
}
