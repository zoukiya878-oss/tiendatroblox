import { prisma } from "@/lib/prisma";

export interface PaymentIntegrationSettings {
  gachthefastApiKey: string;
  gachthefastPartnerId: string;
}

const DEFAULTS: PaymentIntegrationSettings = {
  gachthefastApiKey: "",
  gachthefastPartnerId: "",
};

// ponytail: lưu ở key riêng "payment_integrations", KHÔNG chung với
// SiteSetting key="site" — cái đó được đọc bởi Header/Footer/MobileBottomNav
// (component client), lỡ trộn chung API secret sẽ lộ ra bundle trình duyệt.
// Chỉ admin server-side đọc file này.
export async function getPaymentIntegrationSettings(): Promise<PaymentIntegrationSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "payment_integrations" } });
  if (!row) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(row.value) };
  } catch {
    return DEFAULTS;
  }
}

export async function savePaymentIntegrationSettings(data: PaymentIntegrationSettings) {
  await prisma.siteSetting.upsert({
    where: { key: "payment_integrations" },
    update: { value: JSON.stringify(data) },
    create: { key: "payment_integrations", value: JSON.stringify(data) },
  });
}
