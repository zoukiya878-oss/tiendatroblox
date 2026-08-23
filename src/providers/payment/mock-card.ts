import type { PaymentProvider } from "./types";

export const MockCardProvider: PaymentProvider = {
  kind: "CARD",
  async createTopupIntent({ topupCode, amount }) {
    return {
      instructions: {
        note: "Hệ thống đang xử lý thẻ, thường mất vài giây đến vài phút",
        amount: amount.toString(),
        orderId: topupCode,
      },
    };
  },
};
