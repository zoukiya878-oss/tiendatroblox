import type { PaymentProvider, TopupProviderKind } from "./types";
import { MockBankProvider } from "./mock-bank";
import { MockMomoProvider } from "./mock-momo";
import { MockTheSieuReProvider } from "./mock-thesieure";
import { MockCardProvider } from "./mock-card";

const providers: Record<TopupProviderKind, PaymentProvider> = {
  BANK: MockBankProvider,
  MOMO: MockMomoProvider,
  THESIEURE: MockTheSieuReProvider,
  CARD: MockCardProvider,
};

// ponytail: PAYMENT_PROVIDER_MODE is always "mock" this milestone; swap this
// lookup for real providers keyed the same way when real gateways land.
export function getPaymentProvider(kind: TopupProviderKind): PaymentProvider {
  return providers[kind];
}
