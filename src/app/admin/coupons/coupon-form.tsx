"use client";

import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Coupon } from "@prisma/client";

function toDateInputValue(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : label}
    </Button>
  );
}

export function CouponForm({ action, coupon }: { action: (formData: FormData) => void; coupon?: Coupon }) {
  return (
    <form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Mã coupon</Label>
        <Input id="code" name="code" required defaultValue={coupon?.code} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Loại giảm giá</Label>
        <select
          id="type"
          name="type"
          defaultValue={coupon?.type ?? "PERCENT"}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
        >
          <option value="PERCENT">Phần trăm (%)</option>
          <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value">Giá trị</Label>
        <Input id="value" name="value" type="number" min={0} required defaultValue={coupon ? Number(coupon.value) : undefined} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minimumOrder">Đơn tối thiểu (VND)</Label>
        <Input
          id="minimumOrder"
          name="minimumOrder"
          type="number"
          min={0}
          defaultValue={coupon?.minimumOrder ? Number(coupon.minimumOrder) : undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maximumDiscount">Giảm tối đa (VND)</Label>
        <Input
          id="maximumDiscount"
          name="maximumDiscount"
          type="number"
          min={0}
          defaultValue={coupon?.maximumDiscount ? Number(coupon.maximumDiscount) : undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usageLimit">Giới hạn lượt dùng (tổng)</Label>
        <Input id="usageLimit" name="usageLimit" type="number" min={0} defaultValue={coupon?.usageLimit ?? undefined} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usagePerUser">Giới hạn lượt dùng / user</Label>
        <Input id="usagePerUser" name="usagePerUser" type="number" min={0} defaultValue={coupon?.usagePerUser ?? undefined} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startAt">Ngày bắt đầu</Label>
        <Input id="startAt" name="startAt" type="date" defaultValue={toDateInputValue(coupon?.startAt ?? null)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endAt">Ngày kết thúc</Label>
        <Input id="endAt" name="endAt" type="date" defaultValue={toDateInputValue(coupon?.endAt ?? null)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch name="active" defaultChecked={coupon?.active ?? true} />
        Kích hoạt
      </label>
      <div className="md:col-span-3">
        <SubmitButton label={coupon ? "Lưu thay đổi" : "Tạo coupon"} />
      </div>
    </form>
  );
}
