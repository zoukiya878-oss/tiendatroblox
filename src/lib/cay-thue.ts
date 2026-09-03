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

// Khách chọn được nhiều dịch vụ cày thuê (nhiều dropdown trong màn sản phẩm).
// Lưu vào customFields["dich-vu-cay-thue"] dạng các nhãn nối bằng "\n".
// Nhãn đơn lẻ (đơn cũ, không có "\n") vẫn parse ra [nhãn] — không vỡ đơn cũ.
export function parseCayThuePicked(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Hiển thị danh sách dịch vụ đã chọn (trang đơn hàng).
export function formatCayThuePicked(value: string | null | undefined): string {
  return parseCayThuePicked(value).join(", ");
}

// Phụ phí dịch vụ cày thuê của 1 dòng hàng (chưa nhân số lượng).
// Cộng dồn mọi dịch vụ khách chọn; chọn trùng 1 dịch vụ nhiều lần thì tính nhiều lần.
export function cayThueExtra(
  customFields: Record<string, string> | null | undefined,
  services: CayThueService[]
): bigint {
  let sum = 0n;
  for (const picked of parseCayThuePicked(customFields?.[CAY_THUE_FIELD_KEY])) {
    const hit = services.find((s) => cayThueLabel(s) === picked);
    if (hit) sum += BigInt(hit.price);
  }
  return sum;
}
