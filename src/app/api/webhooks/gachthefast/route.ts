import { NextRequest, NextResponse } from "next/server";
import { processTopupWebhook } from "@/modules/topups/process-topup";

// ponytail: gachthefast.com's exact callback param names aren't confirmed yet
// (no signature/HMAC documented for this provider — a shared `token` query
// param on the registered callback URL is our only auth until real docs or a
// live test hit shows the true field names). Logs every request raw so the
// first real callback tells us exactly what to map. DO NOT credit wallets
// from a field we're only guessing at — log and 200 back until confirmed.
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  console.log("[gachthefast webhook] GET", params);

  const expectedToken = process.env.GACHTHEFAST_WEBHOOK_TOKEN;
  if (!expectedToken || params.token !== expectedToken) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const topupCode = params.orderId || params.order_id || params.ma_don_hang || params.code;
  const success =
    params.success === "true" || params.status === "1" || params.status === "success";

  if (!topupCode) {
    console.warn("[gachthefast webhook] no recognizable order/topup code in params:", params);
    return NextResponse.json({ received: true, mapped: false });
  }

  try {
    const result = await processTopupWebhook({
      provider: "gachthefast",
      externalEventId: params.transId || params.transaction_id || `${topupCode}-${Date.now()}`,
      topupCode,
      success,
      payload: params,
    });
    return NextResponse.json({ received: true, mapped: true, ...result });
  } catch (err) {
    console.error("[gachthefast webhook] processTopupWebhook failed", err);
    return NextResponse.json({ received: true, mapped: false });
  }
}
