"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/app/(public)/vat-pham/[slug]/actions";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await addToCartAction({ productId, quantity: 1, customFields: {} });
        toast.success("Đã thêm vào giỏ hàng");
      } catch {
        toast.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={disabled || isPending}
      className="w-full"
    >
      <ShoppingCart /> Thêm giỏ
    </Button>
  );
}
