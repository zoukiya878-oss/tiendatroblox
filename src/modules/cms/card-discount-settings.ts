import { prisma } from "@/lib/prisma";

// Đúng 5 giá trị telco hợp lệ theo tài liệu chính thức của platform
// gachthefast đang dùng (endpoint /chargingws/price trả về đúng 5 key này).
export type CardTelco = "VIETTEL" | "VINAPHONE" | "MOBIFONE" | "GATE" | "ZING";

export type CardDiscountRates = Record<CardTelco, number>;

// % thực nhận vào ví khách trên mệnh giá thẻ khai báo (VD 85 = thẻ 100k chỉ
// cộng 85k vào ví, 15k là chiết khấu shop giữ). 100 = không chiết khấu.
const DEFAULTS: CardDiscountRates = {
  VIETTEL: 100,
  VINAPHONE: 100,
  MOBIFONE: 100,
  GATE: 100,
  ZING: 100,
};

export async function getCardDiscountRates(): Promise<CardDiscountRates> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "card_discount_rates" } });
  if (!row) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(row.value) };
  } catch {
    return DEFAULTS;
  }
}

export async function saveCardDiscountRates(data: CardDiscountRates) {
  await prisma.siteSetting.upsert({
    where: { key: "card_discount_rates" },
    update: { value: JSON.stringify(data) },
    create: { key: "card_discount_rates", value: JSON.stringify(data) },
  });
}
