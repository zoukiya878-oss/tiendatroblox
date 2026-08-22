import type { PaymentProvider } from "./types";

export const MockTheSieuReProvider: PaymentProvider = {
  kind: "THESIEURE",
  async createTopupIntent({ topupCode, amount }) {
    return {
      instructions: {
        gateway: "TheSieuRe (Mock)",
        amount: amount.toString(),
        orderId: topupCode,
      },
    };
  },
};
