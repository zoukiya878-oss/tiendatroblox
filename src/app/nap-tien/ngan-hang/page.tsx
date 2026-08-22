import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AmountTopupForm } from "../amount-topup-form";
import { createBankTopupAction } from "../actions";

export default async function NapTienNganHangPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/dang-nhap?callbackUrl=/nap-tien/ngan-hang");

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nạp tiền qua Ngân hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <AmountTopupForm action={createBankTopupAction} />
        </CardContent>
      </Card>
    </div>
  );
}
