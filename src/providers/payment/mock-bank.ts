import type { PaymentProvider } from "./types";

export const MockBankProvider: PaymentProvider = {
  kind: "BANK",
  async createTopupIntent({ topupCode, amount }) {
    return {
      instructions: {
        bankName: "MB Bank (Mock)",
        accountNumber: "0888888888",
        accountName: "TIENDATROBLOX",
        amount: amount.toString(),
        transferContent: topupCode,
      },
    };
  },
};
