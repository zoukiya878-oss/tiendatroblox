"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/modules/auth/schemas";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <AlertDescription>Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.</AlertDescription>
        </Alert>
        <Button className="w-full" nativeButton={false} render={<Link href="/dang-nhap" />}>
          Đến trang đăng nhập
        </Button>
      </div>
    );
  }

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("token", token);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);
    startTransition(() => formAction(formData));
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending || !token} className="w-full">
        {pending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}
