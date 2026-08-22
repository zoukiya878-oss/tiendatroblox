import type { PaymentProvider } from "./types";

export const MockMomoProvider: PaymentProvider = {
  kind: "MOMO",
  async createTopupIntent({ topupCode, amount }) {
    return {
      instructions: {
        receiver: "0977777777 (Mock Momo)",
        amount: amount.toString(),
        transferContent: topupCode,
      },
    };
  },
};
