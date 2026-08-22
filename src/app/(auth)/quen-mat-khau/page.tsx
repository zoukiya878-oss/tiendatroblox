import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function QuenMatKhauPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
