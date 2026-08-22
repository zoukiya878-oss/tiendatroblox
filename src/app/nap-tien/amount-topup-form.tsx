"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TopupState } from "./actions";

const initialState: TopupState = {};

export function AmountTopupForm({
  action,
}: {
  action: (prevState: TopupState, formData: FormData) => Promise<TopupState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Số tiền nạp (đ)</Label>
        <Input id="amount" name="amount" type="number" min={10000} step={1000} placeholder="Ví dụ: 50000" required />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang xử lý..." : "Tiếp tục"}
      </Button>
    </form>
  );
}
