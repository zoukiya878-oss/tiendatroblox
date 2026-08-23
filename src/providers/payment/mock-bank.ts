import { getSiteSettings } from "@/modules/cms/site-settings";
import type { PaymentProvider } from "./types";

export const MockBankProvider: PaymentProvider = {
  kind: "BANK",
  async createTopupIntent({ topupCode, amount }) {
    const settings = await getSiteSettings();
    return {
      instructions: {
        bankName: settings.bankName || "Chưa cấu hình",
        bankCode: settings.bankCode,
        accountNumber: settings.bankAccountNumber,
        accountName: settings.bankAccountName,
        amount: amount.toString(),
        transferContent: topupCode,
      },
    };
  },
};
