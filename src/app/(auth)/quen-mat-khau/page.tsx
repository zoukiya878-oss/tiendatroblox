import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ponytail: tính năng gửi email đặt lại mật khẩu tạm ngừng — chưa có email
// provider thật (Resend cần domain riêng để verify gửi mail). Bật lại bằng
// cách khôi phục <ForgotPasswordForm /> khi đã có RESEND_API_KEY.
export default function QuenMatKhauPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Tính năng đặt lại mật khẩu qua email đang tạm ngừng để bảo trì. Vui lòng liên hệ hỗ trợ để được cấp lại
            mật khẩu.
          </p>
          <Link href="/lien-he" className="text-sm text-primary hover:underline">
            Xem thông tin liên hệ →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
