"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addToCartAction } from "@/app/(public)/vat-pham/[slug]/actions";
import { formatVnd } from "@/lib/money";
import type { ProductField } from "@prisma/client";

interface FormValues {
  quantity: number;
  [key: string]: string | number;
}

// Field key cố định do nút "+ Dropdown dịch vụ cày thuê" trong form admin sinh ra.
const CAY_THUE_FIELD_KEY = "dich-vu-cay-thue";

export function ProductPurchaseForm({
  productId,
  fields,
  outOfStock,
  cayThueServices,
}: {
  productId: string;
  fields: ProductField[];
  outOfStock: boolean;
  cayThueServices?: { name: string; price: number }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [buyNowPending, setBuyNowPending] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { quantity: 1 } });

  function extractCustomFields(values: FormValues): Record<string, string> {
    const customFields: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.key];
      if (v !== undefined) customFields[f.key] = String(v);
    }
    return customFields;
  }

  function onAddToCart(values: FormValues) {
    startTransition(async () => {
      try {
        await addToCartAction({
          productId,
          quantity: Number(values.quantity) || 1,
          customFields: extractCustomFields(values),
        });
        toast.success("Đã thêm vào giỏ hàng");
      } catch {
        toast.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
      }
    });
  }

  function onBuyNow() {
    setBuyNowPending(true);
    const values = getValues();
    const customFields = extractCustomFields(values);
    const qty = Number(values.quantity) || 1;
    router.push(
      `/checkout?buyNow=${productId}&qty=${qty}&fields=${encodeURIComponent(JSON.stringify(customFields))}`
    );
  }

  return (
    <form onSubmit={handleSubmit(onAddToCart)} className="flex flex-col gap-4">
      {fields.map((f) => (
        <div key={f.id} className="flex flex-col gap-1">
          <Label htmlFor={f.key}>
            {f.label}
            {f.required && <span className="text-destructive"> *</span>}
          </Label>
          {f.type === "TEXTAREA" ? (
            <Textarea
              id={f.key}
              placeholder={f.placeholder ?? undefined}
              {...register(f.key, { required: f.required && `Vui lòng nhập ${f.label}` })}
            />
          ) : f.type === "SELECT" ? (
            <select
              id={f.key}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
              {...register(f.key, { required: f.required && `Vui lòng chọn ${f.label}` })}
            >
              <option value="">-- Chọn --</option>
              {f.key === CAY_THUE_FIELD_KEY && cayThueServices && cayThueServices.length > 0
                ? cayThueServices.map((s) => {
                    const label = s.price > 0 ? `${s.name} — ${formatVnd(s.price)}` : s.name;
                    return (
                      <option key={s.name} value={label}>
                        {label}
                      </option>
                    );
                  })
                : (f.options ?? "").split(",").filter(Boolean).map((opt) => (
                    <option key={opt} value={opt.trim()}>
                      {opt.trim()}
                    </option>
                  ))}
            </select>
          ) : (
            <Input
              id={f.key}
              type={f.type === "NUMBER" ? "number" : "text"}
              placeholder={f.placeholder ?? undefined}
              {...register(f.key, { required: f.required && `Vui lòng nhập ${f.label}` })}
            />
          )}
          {errors[f.key] && (
            <span className="text-xs text-destructive">{String(errors[f.key]?.message)}</span>
          )}
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <Label htmlFor="quantity">Số lượng</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          className="w-28"
          {...register("quantity", { required: true, min: 1, valueAsNumber: true })}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="secondary" className="flex-1" disabled={outOfStock || isPending}>
          <ShoppingCart /> Thêm vào giỏ
        </Button>
        <Button type="button" className="flex-1" disabled={outOfStock || buyNowPending} onClick={onBuyNow}>
          <Zap /> Mua ngay
        </Button>
      </div>
    </form>
  );
}
