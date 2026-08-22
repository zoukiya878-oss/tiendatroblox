"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { registerUser, RegisterError } from "@/modules/auth/register";

export type RegisterState = { error?: string };

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp" };
  }

  try {
    await registerUser({ username, email, password });
  } catch (err) {
    if (err instanceof RegisterError) return { error: err.message };
    throw err;
  }

  try {
    await signIn("credentials", { username, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      // Đăng ký thành công nhưng tự đăng nhập thất bại (hiếm khi xảy ra) — vẫn coi là thành công.
      return {};
    }
    throw err; // NEXT_REDIRECT
  }

  return {};
}
