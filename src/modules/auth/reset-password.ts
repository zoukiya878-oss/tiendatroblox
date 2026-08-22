import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordFormSchema } from "./schemas";

export class ResetPasswordError extends Error {}

export async function resetPassword(input: { token: string; password: string }) {
  if (!input.token) throw new ResetPasswordError("Thiếu mã token");
  const parsed = resetPasswordFormSchema.safeParse({
    password: input.password,
    confirmPassword: input.password,
  });
  if (!parsed.success) {
    throw new ResetPasswordError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }
  const { token } = input;
  const { password } = parsed.data;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new ResetPasswordError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}
