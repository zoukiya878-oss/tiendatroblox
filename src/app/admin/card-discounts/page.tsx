import { getCardDiscountRates } from "@/modules/cms/card-discount-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateCardDiscountRatesAction } from "./actions";

const TELCO_LABELS: Record<string, string> = {
  VIETTEL: "Viettel",
  VINAPHONE: "Vinaphone",
  MOBIFONE: "Mobifone",
  VNMOBILE: "Vietnamobile",
  GATE: "Gate (Zing)",
};

export default async function AdminCardDiscountsPage() {
  const rates = await getCardDiscountRates();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Chiết khấu thẻ cào</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ cộng ví theo mệnh giá thẻ</CardTitle>
          <CardDescription>
            % số tiền thực cộng vào ví khách trên mệnh giá thẻ khai báo. VD: 85% nghĩa là thẻ 100.000đ chỉ cộng
            85.000đ vào ví (15.000đ là chiết khấu). Áp dụng ngay cho các đơn nạp thẻ mới tạo sau khi lưu — không ảnh
            hưởng đơn đã xử lý trước đó.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCardDiscountRatesAction} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.keys(TELCO_LABELS) as (keyof typeof TELCO_LABELS)[]).map((telco) => (
              <div key={telco} className="flex flex-col gap-1.5">
                <Label htmlFor={telco}>{TELCO_LABELS[telco]} (%)</Label>
                <Input
                  id={telco}
                  name={telco}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={rates[telco as keyof typeof rates]}
                  required
                />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 lg:col-span-5">
              <Button type="submit">Lưu chiết khấu</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
