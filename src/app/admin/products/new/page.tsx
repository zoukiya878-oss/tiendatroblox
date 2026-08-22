import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Thêm sản phẩm</h1>
      <ProductForm action={createProductAction} categories={categories} />
    </div>
  );
}
