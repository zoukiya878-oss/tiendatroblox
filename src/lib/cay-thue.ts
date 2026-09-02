import { formatVnd } from "./money";

// Field key do nút "+ Dropdown dịch vụ cày thuê" trong form admin sinh ra.
export const CAY_THUE_FIELD_KEY = "dich-vu-cay-thue";

export interface CayThueService {
  name: string;
  price: number; // VND nguyên, 0 = chưa đặt giá
}

// Nhãn hiển thị = value lưu vào đơn. Client (dropdown) và server (tính tiền)
// phải dùng chung hàm này để khớp value <-> giá.
export function cayThueLabel(s: CayThueService): string {
  return s.price > 0 ? `${s.name} — ${formatVnd(s.price)}` : s.name;
}

// Phụ phí dịch vụ cày thuê của 1 dòng hàng (chưa nhân số lượng).
export function cayThueExtra(
  customFields: Record<string, string> | null | undefined,
  services: CayThueService[]
): bigint {
  const picked = customFields?.[CAY_THUE_FIELD_KEY];
  if (!picked) return 0n;
  const hit = services.find((s) => cayThueLabel(s) === picked);
  return hit ? BigInt(hit.price) : 0n;
}
