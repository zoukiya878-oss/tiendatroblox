"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/") || "/";

  if (!username || !password) {
    return { error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}:${username.toLowerCase()}`, 5, 15 * 60 * 1000)) {
    return { error: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút" };
  }

  try {
    await signIn("credentials", { username, password, redirectTo: callbackUrl });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Tên đăng nhập hoặc mật khẩu không đúng" };
    }
    throw err; // NEXT_REDIRECT phải được rethrow để chuyển hướng hoạt động
  }

  return {};
}
