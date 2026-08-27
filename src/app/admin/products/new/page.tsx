import { prisma } from "@/lib/prisma";
import { getCayThueServices } from "@/modules/cms/cay-thue-settings";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  const [categories, cayThueServices] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getCayThueServices(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Thêm sản phẩm</h1>
      <ProductForm action={createProductAction} categories={categories} cayThueServices={cayThueServices} />
    </div>
  );
}
