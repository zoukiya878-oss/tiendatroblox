import { prisma } from "@/lib/prisma";
import type { CayThueService } from "@/lib/cay-thue";

export type { CayThueService } from "@/lib/cay-thue";

const KEY = "cay_thue_services";

// ponytail: giá lưu Number trong JSON SiteSetting (không phải money-path DB) —
// khách chọn xong phụ phí được cộng vào subtotal đơn (xem lib/cay-thue.ts).
function normalize(raw: unknown): CayThueService {
  if (typeof raw === "string") return { name: raw.trim(), price: 0 };
  const o = raw as { name?: unknown; price?: unknown };
  const price = Math.max(0, Math.round(Number(o?.price) || 0));
  return { name: String(o?.name ?? "").trim(), price };
}

// Danh sách dịch vụ cày thuê. Admin sửa ở /admin/cay-thue.
// Dùng làm options cho ProductField "dich-vu-cay-thue" (SELECT) — dropdown ở
// trang sản phẩm đọc trực tiếp danh sách này (live), không dùng snapshot.
export async function getCayThueServices(): Promise<CayThueService[]> {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  if (!row) return [];
  try {
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? parsed.map(normalize).filter((s) => s.name !== "") : [];
  } catch {
    return [];
  }
}

export async function saveCayThueServices(services: CayThueService[]) {
  // ponytail: bỏ dấu phẩy khỏi tên — ProductField.options split theo "," ở form.
  const seen = new Set<string>();
  const clean: CayThueService[] = [];
  for (const s of services.map(normalize)) {
    if (!s.name || seen.has(s.name)) continue;
    seen.add(s.name);
    clean.push({ name: s.name.replace(/,/g, " ").trim(), price: s.price });
  }
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(clean) },
    create: { key: KEY, value: JSON.stringify(clean) },
  });
  return clean;
}
