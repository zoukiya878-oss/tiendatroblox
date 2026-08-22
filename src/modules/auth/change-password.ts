import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { changePasswordFormSchema } from "./schemas";

export class ChangePasswordError extends Error {}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string }
) {
  const parsed = changePasswordFormSchema.safeParse({
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
    confirmPassword: input.newPassword,
  });
  if (!parsed.success) {
    throw new ChangePasswordError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new ChangePasswordError("Mật khẩu hiện tại không đúng");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
