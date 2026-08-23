import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";
import { processTopupWebhook } from "@/modules/topups/process-topup";

// Casso webhook v2 — docs: https://developer.casso.vn/english-v2-new/webhook
// Header "X-Casso-Signature: t=<timestamp>,v1=<hex hmac>". v1 = HMAC-SHA512
// (checksum key = Security Key from Casso dashboard) of "<t>.<JSON.stringify(sortedBody)>",
// where sortedBody has every object's keys sorted A->Z recursively.
// Reference implementation: github.com/CassoHQ/casso-webhook-v2-verify-signature
interface CassoTransaction {
  id: number;
  reference: string;
  description: string;
  amount: number;
  transactionDateTime: string;
}

function sortObjectKeys(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(sortObjectKeys);
  if (data !== null && typeof data === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(data as Record<string, unknown>).sort()) {
      sorted[key] = sortObjectKeys((data as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return data;
}

function verifyCassoSignature(signatureHeader: string | null, body: unknown, checksumKey: string): boolean {
  if (!signatureHeader) return false;
  const match = signatureHeader.match(/t=(\d+),v1=([a-f0-9]+)/);
  if (!match) return false;
  const [, timestamp, signature] = match;
  const messageToSign = `${timestamp}.${JSON.stringify(sortObjectKeys(body))}`;
  const expected = createHmac("sha512", checksumKey).update(messageToSign).digest("hex");
  return signature === expected;
}

export async function POST(req: NextRequest) {
  const settings = await getPaymentIntegrationSettings();
  if (!settings.bankAutoWebhookToken) {
    return NextResponse.json({ error: "bank auto not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const signatureHeader = req.headers.get("x-casso-signature");
  if (!verifyCassoSignature(signatureHeader, body, settings.bankAutoWebhookToken)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const tx: CassoTransaction | undefined = body?.data;
  if (!tx || typeof tx.amount !== "number") {
    return NextResponse.json({ received: true, mapped: false });
  }

  // Chỉ xử lý tiền VÀO (Casso không có field direction riêng, amount âm = tiền ra).
  if (tx.amount <= 0) {
    return NextResponse.json({ received: true, mapped: false, reason: "outgoing transaction" });
  }

  const match = tx.description?.match(/ROBO[A-Z0-9]{6}/i);
  if (!match) {
    console.warn("[casso webhook] no topupCode found in description:", tx.description);
    return NextResponse.json({ received: true, mapped: false });
  }
  const topupCode = match[0].toUpperCase();

  try {
    const result = await processTopupWebhook({
      provider: "casso",
      externalEventId: String(tx.id),
      topupCode,
      success: true,
      payload: tx,
      actualAmount: BigInt(Math.round(tx.amount)),
    });
    return NextResponse.json({ received: true, mapped: true, ...result });
  } catch (err) {
    console.error("[casso webhook] processTopupWebhook failed", err);
    return NextResponse.json({ received: true, mapped: false });
  }
}
