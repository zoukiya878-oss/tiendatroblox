"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "@/app/admin/products/product-form";
import { updateProductInlineAction } from "@/app/admin/products/actions";
import type { Product, ProductField, ProductImage } from "@prisma/client";

// Nút sửa sản phẩm chỉ hiện cho admin ngay trên trang sản phẩm storefront.
// Mở popup dùng lại ProductForm của admin; lưu xong action revalidate + ở lại trang.
export function AdminEditProductDialog({
  product,
  categories,
  cayThueServices,
}: {
  product: Product & { images: ProductImage[]; fields: ProductField[] };
  categories: { id: string; name: string }[];
  cayThueServices: { name: string; price: number }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-40 shadow-lg" />
        }
      >
        <Pencil className="size-3.5" />
        Sửa sản phẩm
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm: {product.name}</DialogTitle>
        </DialogHeader>
        <ProductForm
          action={updateProductInlineAction.bind(null, product.id)}
          categories={categories}
          product={product}
          cayThueServices={cayThueServices}
        />
      </DialogContent>
    </Dialog>
  );
}
