export type TopupProviderKind = "BANK" | "MOMO" | "THESIEURE" | "CARD";

export interface CreateTopupIntentInput {
  topupCode: string;
  amount: bigint;
}

export interface CreateTopupIntentResult {
  instructions: Record<string, string>;
  externalTransactionId?: string;
}

export interface PaymentProvider {
  kind: TopupProviderKind;
  createTopupIntent(input: CreateTopupIntentInput): Promise<CreateTopupIntentResult>;
}
