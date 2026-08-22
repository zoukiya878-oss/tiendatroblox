"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};
const GENERIC_MESSAGE =
  "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.submitted) {
    return (
      <Alert>
        <AlertDescription>{GENERIC_MESSAGE}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email đã đăng ký</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/dang-nhap" className="text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
