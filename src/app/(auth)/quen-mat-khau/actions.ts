"use server";

import { headers } from "next/headers";
import { requestPasswordReset } from "@/modules/auth/request-password-reset";
import { rateLimit } from "@/lib/rate-limit";

export type ForgotPasswordState = { submitted?: boolean; error?: string };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Vui lòng nhập email" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`forgot:${ip}:${email}`, 5, 15 * 60 * 1000)) {
    // Vẫn trả về thông báo chung để không lộ thông tin, chỉ âm thầm bỏ qua gửi email.
    return { submitted: true };
  }

  await requestPasswordReset(email);
  return { submitted: true };
}
