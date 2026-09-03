// Chuẩn hoá ảnh sản phẩm: đưa về khung vuông bằng PAD (không crop — thêm viền
// nền cho đủ khung) + nén qua Cloudinary transform ở URL giao. Ảnh luôn hiển
// thị đầy đủ, khung vuông khớp card ở cả mobile lẫn PC.
// Áp cho cả ảnh cũ (không cần migrate) lẫn ảnh mới. URL non-Cloudinary trả nguyên.
export function productImage(url: string | null | undefined, size = 800): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com/") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/c_pad,b_auto,w_${size},h_${size},f_auto,q_auto/`);
}
