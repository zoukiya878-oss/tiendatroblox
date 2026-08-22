import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "./register-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function DangKyPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4">
            <OAuthButtons callbackUrl="/" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
