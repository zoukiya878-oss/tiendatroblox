"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { changePassword, ChangePasswordError } from "@/modules/auth/change-password";

export type ChangePasswordState = { success?: boolean; error?: string };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp" };
  }

  try {
    await changePassword(session.user.id, { currentPassword, newPassword });
  } catch (err) {
    if (err instanceof ChangePasswordError) return { error: err.message };
    throw err;
  }

  return { success: true };
}
