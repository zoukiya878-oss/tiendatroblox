import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default async function DangNhapPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl || "/"} />
          <div className="mt-4">
            <OAuthButtons callbackUrl={callbackUrl || "/"} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
