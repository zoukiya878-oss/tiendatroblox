import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CardTopupForm } from "./card-topup-form";

export default async function NapTienTheCaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/dang-nhap?callbackUrl=/nap-tien/the-cao");

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nạp tiền qua Thẻ cào</CardTitle>
        </CardHeader>
        <CardContent>
          <CardTopupForm />
        </CardContent>
      </Card>
    </div>
  );
}
