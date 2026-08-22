"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createCardTopupAction, type TopupState } from "../actions";

const initialState: TopupState = {};

export function CardTopupForm() {
  const [state, formAction, pending] = useActionState(createCardTopupAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cardProvider">Nhà mạng</Label>
        <select
          id="cardProvider"
          name="cardProvider"
          required
          defaultValue=""
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="" disabled>
            Chọn nhà mạng
          </option>
          <option value="VIETTEL">Viettel</option>
          <option value="VINAPHONE">Vinaphone</option>
          <option value="MOBIFONE">Mobifone</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Mệnh giá thẻ (đ)</Label>
        <Input id="amount" name="amount" type="number" min={10000} step={1000} placeholder="Ví dụ: 50000" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="serial">Số Serial</Label>
        <Input id="serial" name="serial" placeholder="Số serial in trên thẻ" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cardCode">Mã thẻ</Label>
        <Input id="cardCode" name="cardCode" placeholder="Mã thẻ cào" required />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang xử lý..." : "Nạp thẻ"}
      </Button>
    </form>
  );
}
