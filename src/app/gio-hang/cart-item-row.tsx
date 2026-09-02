"use client";

import { useTransition } from "react";
import { formatVnd } from "@/lib/money";
import { productImage } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateQuantityAction, removeItemAction } from "./actions";

export function CartItemRow({
  id,
  name,
  imageUrl,
  price,
  quantity,
}: {
  id: string;
  name: string;
  imageUrl: string | null;
  price: bigint;
  quantity: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={productImage(imageUrl, 120)} alt={name} className="size-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{formatVnd(price)}</p>
      </div>

      <Input
        type="number"
        min={1}
        value={quantity}
        disabled={isPending}
        className="w-16 text-center"
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!Number.isFinite(next)) return;
          startTransition(() => updateQuantityAction(id, next));
        }}
      />

      <p className="w-28 shrink-0 text-right font-medium">{formatVnd(price * BigInt(quantity))}</p>

      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => removeItemAction(id))}
      >
        Xoá
      </Button>
    </div>
  );
}
