import type { PaymentProvider } from "./types";

export const MockCardProvider: PaymentProvider = {
  kind: "CARD",
  async createTopupIntent({ topupCode, amount }) {
    return {
      instructions: {
        note: "Nhập serial/mã thẻ ở form nạp thẻ (mock)",
        amount: amount.toString(),
        orderId: topupCode,
      },
    };
  },
};
