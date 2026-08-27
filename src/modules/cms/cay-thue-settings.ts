import { prisma } from "@/lib/prisma";

const KEY = "cay_thue_services";

// Danh sách dịch vụ cày thuê (tên hiển thị). Admin sửa ở /admin/cay-thue.
// Dùng làm options cho ProductField kiểu SELECT khi bấm nút
// "+ Dropdown dịch vụ cày thuê" trong form sản phẩm.
export async function getCayThueServices(): Promise<string[]> {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  if (!row) return [];
  try {
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string" && s.trim() !== "") : [];
  } catch {
    return [];
  }
}

export async function saveCayThueServices(services: string[]) {
  // ponytail: bỏ dấu phẩy — options ProductField SELECT split theo "," ở
  // purchase form, tên có "," sẽ vỡ dropdown.
  const clean = [...new Set(services.map((s) => s.replace(/,/g, " ").trim()).filter(Boolean))];
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(clean) },
    create: { key: KEY, value: JSON.stringify(clean) },
  });
  return clean;
}
