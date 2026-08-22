import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { emailProvider } from "@/providers/email/development";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ

/**
 * Luôn resolve thành công (không throw, không tiết lộ email có tồn tại hay
 * không) — caller hiển thị cùng một thông báo bất kể kết quả thật.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.email) return;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = `${process.env.APP_URL}/reset-mat-khau?token=${token}`;
  await emailProvider.send(
    user.email,
    "Đặt lại mật khẩu - Tiendatroblox",
    `<p>Xin chào ${user.username},</p>
     <p>Nhấn vào liên kết sau để đặt lại mật khẩu (liên kết hết hạn sau 1 giờ):</p>
     <p><a href="${link}">${link}</a></p>
     <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>`
  );
}
