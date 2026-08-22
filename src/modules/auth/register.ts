import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "./schemas";

export type RegisterInput = { username: string; email: string; password: string };

export class RegisterError extends Error {}

export async function registerUser(input: RegisterInput) {
  // confirmPassword không áp dụng ở server, chỉ cần password === password để pass refine.
  const parsed = registerSchema.safeParse({ ...input, confirmPassword: input.password });
  if (!parsed.success) {
    throw new RegisterError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }
  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { username: true, email: true },
  });
  if (existing) {
    throw new RegisterError(
      existing.username === username ? "Tên đăng nhập đã tồn tại" : "Email đã được sử dụng"
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { username, email, passwordHash } });
    await tx.wallet.create({ data: { userId: created.id, balance: 0n } });
    return created;
  });

  return { id: user.id, username: user.username, email: user.email };
}
