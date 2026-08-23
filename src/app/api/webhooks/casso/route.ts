import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";
import { processTopupWebhook } from "@/modules/topups/process-topup";

// Casso webhook v2 — docs: https://developer.casso.vn/english-v2-new/webhook
// POST, header X-Casso-Signature carries the Security Key set when
// registering the webhook in the Casso dashboard (static secret, compared
// for equality — Casso doesn't document an HMAC scheme for it).
interface CassoTransaction {
  id: number;
  reference: string;
  description: string;
  amount: number;
  transactionDateTime: string;
}

export async function POST(req: NextRequest) {
  const settings = await getPaymentIntegrationSettings();
  if (!settings.bankAutoWebhookToken) {
    return NextResponse.json({ error: "bank auto not configured" }, { status: 503 });
  }

  const signature = req.headers.get("x-casso-signature");
  if (signature !== settings.bankAutoWebhookToken) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
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
