"use client";

import { useActionState } from "react";
import Link from "next/link";
import { formatVnd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { previewCouponAction, placeOrderAction, type CheckoutState } from "./actions";

const initialState: CheckoutState = {};

export function CheckoutForm({
  hiddenFields,
  subtotal,
  walletBalance,
}: {
  hiddenFields: Record<string, string>;
  subtotal: bigint;
  walletBalance: bigint;
}) {
  const [couponState, couponFormAction, couponPending] = useActionState(previewCouponAction, initialState);
  const [orderState, orderFormAction, orderPending] = useActionState(placeOrderAction, initialState);

  const discount = couponState.discount ? BigInt(couponState.discount) : 0n;
  const total = subtotal - discount;
  const insufficient = walletBalance < total;

  return (
    <form className="flex flex-col gap-4">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="couponCodeInput">Mã giảm giá</Label>
        <div className="flex gap-2">
          <Input
            id="couponCodeInput"
            name="couponCode"
            placeholder="Nhập mã giảm giá (nếu có)"
            defaultValue={couponState.couponCode ?? ""}
          />
          <Button type="submit" variant="outline" disabled={couponPending} formAction={couponFormAction}>
            {couponPending ? "Đang kiểm tra..." : "Áp dụng"}
          </Button>
        </div>
        {couponState.error && (
          <p className="text-xs text-destructive">{couponState.error}</p>
        )}
        {discount > 0n && !couponState.error && (
          <p className="text-xs text-primary">Giảm giá: -{formatVnd(discount)}</p>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatVnd(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Giảm giá</span>
          <span>-{formatVnd(discount)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Tổng cộng</span>
          <span>{formatVnd(total)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Số dư ví</span>
          <span>{formatVnd(walletBalance)}</span>
        </div>
      </div>

      {orderState.error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-2">
            <span>{orderState.error}</span>
            {insufficient && (
              <Button size="sm" className="w-fit" render={<Link href="/nap-tien" />}>
                Nạp tiền
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={orderPending} formAction={orderFormAction}>
        {orderPending ? "Đang xử lý..." : "Đặt hàng"}
      </Button>
    </form>
  );
}
