import { prisma } from "@/lib/prisma";

export interface SiteSettings {
  siteName: string;
  heroTitle: string;
  heroDescription: string;
  facebookUrl: string;
  zaloUrl: string;
  telegramUrl: string;
  supportEmail: string;
  supportHours: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

const DEFAULTS: SiteSettings = {
  siteName: "Shop Anh Robo",
  heroTitle: "Shop Anh Robo - Vật phẩm game giá tốt, giao hàng tức thì",
  heroDescription: "Nạp thẻ, mua vật phẩm game uy tín, giao dịch nhanh chóng 24/7.",
  facebookUrl: "",
  zaloUrl: "",
  telegramUrl: "",
  supportEmail: "",
  supportHours: "8:00 - 22:00 hàng ngày",
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "site" } });
  if (!row) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(row.value) };
  } catch {
    return DEFAULTS;
  }
}
