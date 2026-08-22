"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Tên đăng nhập hoặc email</Label>
        <Input id="username" name="username" autoComplete="username" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <div className="flex justify-end text-sm">
        <Link href="/quen-mat-khau" className="text-primary hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
