import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetMatKhauPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Đặt lại mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          {!token ? (
            <Alert variant="destructive">
              <AlertDescription>Liên kết không hợp lệ. Thiếu mã token.</AlertDescription>
            </Alert>
          ) : (
            <ResetPasswordForm token={token} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
