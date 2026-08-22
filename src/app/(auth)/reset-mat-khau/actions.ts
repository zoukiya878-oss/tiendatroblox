"use server";

import { resetPassword, ResetPasswordError } from "@/modules/auth/reset-password";

export type ResetPasswordState = { success?: boolean; error?: string };

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp" };
  }

  try {
    await resetPassword({ token, password });
  } catch (err) {
    if (err instanceof ResetPasswordError) return { error: err.message };
    throw err;
  }

  return { success: true };
}
