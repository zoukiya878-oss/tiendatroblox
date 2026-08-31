import { getCayThueServices } from "@/modules/cms/cay-thue-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CayThueForm } from "./cay-thue-form";
import { updateCayThueServicesAction } from "./actions";

export default async function AdminCayThuePage() {
  const services = await getCayThueServices();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Quản lý cày thuê</h1>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
          <CardDescription>
            Mỗi dòng là 1 lựa chọn cày thuê. Trong form sản phẩm, bấm nút &quot;+ Dropdown dịch vụ cày thuê&quot; để
            gắn dropdown vào sản phẩm — khách sẽ thấy dropdown chọn dịch vụ khi mua. Dropdown đọc trực tiếp danh sách
            này, sửa ở đây là mọi sản phẩm có dropdown cập nhật theo ngay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CayThueForm action={updateCayThueServicesAction} services={services} />
        </CardContent>
      </Card>
    </div>
  );
}
