import { z } from "zod";

// Tách riêng schema (chỉ phụ thuộc zod) khỏi logic server (prisma/bcrypt) để
// các client component (react-hook-form) có thể import mà không kéo theo
// prisma/bcrypt vào bundle trình duyệt.

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
      .max(32, "Tên đăng nhập tối đa 32 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
