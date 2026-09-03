"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, ShoppingCart, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatVnd } from "@/lib/money";
import { addToCartAction } from "@/app/(public)/vat-pham/[slug]/actions";
import { CAY_THUE_FIELD_KEY, cayThueLabel, type CayThueService } from "@/lib/cay-thue";
import type { ProductField } from "@prisma/client";

interface FormValues {
  quantity: number;
  [key: string]: string | number;
}

export function ProductPurchaseForm({
  productId,
  fields,
  outOfStock,
  cayThueServices,
}: {
  productId: string;
  fields: ProductField[];
  outOfStock: boolean;
  cayThueServices?: CayThueService[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [buyNowPending, setBuyNowPending] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { quantity: 1 } });

  // Field cày thuê: khách chọn nhiều dịch vụ qua nhiều dropdown (nút +).
  const cayThueField = fields.find((f) => f.key === CAY_THUE_FIELD_KEY);
  const cayThueEnabled = !!cayThueField && !!cayThueServices && cayThueServices.length > 0;
  const [cayThuePicks, setCayThuePicks] = useState<string[]>([""]);

  useEffect(() => {
    if (!cayThueEnabled || !cayThueField) return;
    setValue(cayThueField.key, cayThuePicks.filter(Boolean).join("\n"), { shouldValidate: true });
  }, [cayThuePicks, cayThueEnabled, cayThueField, setValue]);

  const cayThueExtraPreview = cayThueEnabled
    ? cayThuePicks.reduce((sum, label) => {
        const hit = cayThueServices!.find((s) => cayThueLabel(s) === label);
        return sum + (hit ? hit.price : 0);
      }, 0)
    : 0;

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
          {f.key === CAY_THUE_FIELD_KEY && cayThueEnabled ? (
            <div className="flex flex-col gap-2">
              <input
                type="hidden"
                {...register(f.key, {
                  validate: (v) =>
                    !f.required || (typeof v === "string" && v.trim().length > 0) || `Vui lòng chọn ${f.label}`,
                })}
              />
              {cayThuePicks.map((pick, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
                    value={pick}
                    onChange={(e) =>
                      setCayThuePicks((prev) => prev.map((p, i) => (i === idx ? e.target.value : p)))
                    }
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {cayThueServices!.map((s) => {
                      const label = cayThueLabel(s);
                      return (
                        <option key={s.name} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {cayThuePicks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setCayThuePicks((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCayThuePicks((prev) => [...prev, ""])}
                >
                  <Plus /> Thêm dịch vụ
                </Button>
                {cayThueExtraPreview > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Phụ phí: +{formatVnd(cayThueExtraPreview)}
                  </span>
                )}
              </div>
            </div>
          ) : f.type === "TEXTAREA" ? (
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
                    const label = cayThueLabel(s);
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
