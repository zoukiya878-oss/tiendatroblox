import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";
import { processTopupWebhook } from "@/modules/topups/process-topup";
import { computeChargingSign } from "@/providers/gachthefast/charging";

// gachthefast POST kết quả xử lý thẻ về đây sau khi admin duyệt (status=99
// lúc gọi API ban đầu). callback_sign dùng cùng công thức với sign gửi đi:
// md5(partnerKey+code+serial). requestId dùng để tìm lại topup vì mã đơn của
// mình không được gửi kèm trong request ban đầu (chỉ có code/serial/amount).
interface GachthefastCallback {
  status: number;
  message?: string;
  value?: string;
  amount?: string;
  code: string;
  serial: string;
  request_id: string;
  telco?: string;
  callback_sign: string;
  trans_id?: string;
}

export async function POST(req: NextRequest) {
  const integration = await getPaymentIntegrationSettings();
  if (!integration.gachthefastApiKey) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const body: GachthefastCallback | null = await req.json().catch(() => null);
  if (!body?.code || !body.serial || !body.request_id) {
    return NextResponse.json({ received: true, mapped: false });
  }

  const expectedSign = computeChargingSign(integration.gachthefastApiKey, body.code, body.serial);
  if (body.callback_sign !== expectedSign) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const topup = await prisma.topup.findFirst({
    where: { meta: { path: ["gachthefastRequestId"], equals: body.request_id } },
  });
  if (!topup) {
    console.warn("[gachthefast webhook] no topup found for request_id:", body.request_id);
    return NextResponse.json({ received: true, mapped: false });
  }

  try {
    // status 1 = đúng thẻ, 2 = đúng thẻ sai mệnh giá (value = mệnh giá thật,
    // processTopupWebhook tự đối chiếu với topup.amount và đánh WRONG_VALUE
    // nếu lệch), còn lại (3/4/100) = thất bại.
    const success = body.status === 1 || body.status === 2;
    const result = await processTopupWebhook({
      provider: "gachthefast",
      externalEventId: body.trans_id || `${body.request_id}-cb`,
      topupCode: topup.topupCode,
      success,
      payload: body as unknown as object,
      actualAmount: success && body.value ? BigInt(body.value) : undefined,
    });
    return NextResponse.json({ received: true, mapped: true, ...result });
  } catch (err) {
    console.error("[gachthefast webhook] processTopupWebhook failed", err);
    return NextResponse.json({ received: true, mapped: false });
  }
}
