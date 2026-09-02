// Chuẩn hoá ảnh sản phẩm: crop vuông + nén qua Cloudinary transform ở URL giao.
// Áp cho cả ảnh cũ (không cần migrate) lẫn ảnh mới. URL non-Cloudinary trả nguyên.
export function productImage(url: string | null | undefined, size = 800): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com/") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/c_fill,g_auto,w_${size},h_${size},f_auto,q_auto/`);
}
