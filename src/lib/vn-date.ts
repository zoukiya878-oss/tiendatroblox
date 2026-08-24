// Vercel chạy server ở UTC, không phải giờ VN — không dùng new Date().getDate()
// (local) để tính mốc ngày/tháng, lệch 7 tiếng làm giao dịch 0h-7h sáng VN bị
// tính nhầm sang ngày/tháng trước. Quy đổi qua "giờ tường VN" trước khi lấy
// mốc, rồi trả về đúng thời điểm UTC thật tương ứng.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export function vnDayBoundary(base: Date, dayOffset = 0): Date {
  const shifted = new Date(base.getTime() + VN_OFFSET_MS);
  const utcMs = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + dayOffset);
  return new Date(utcMs - VN_OFFSET_MS);
}

export function vnMonthStart(base: Date): Date {
  const shifted = new Date(base.getTime() + VN_OFFSET_MS);
  const utcMs = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1);
  return new Date(utcMs - VN_OFFSET_MS);
}

/** Nhãn ngày (VD "24/8") theo giờ VN cho 1 mốc UTC trả về từ vnDayBoundary. */
export function vnDayLabel(boundary: Date): string {
  const vn = new Date(boundary.getTime() + VN_OFFSET_MS);
  return `${vn.getUTCDate()}/${vn.getUTCMonth() + 1}`;
}
