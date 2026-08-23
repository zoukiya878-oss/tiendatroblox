import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";
import { processTopupWebhook } from "@/modules/topups/process-topup";
import { computeChargingSign } from "@/providers/gachthefast/charging";

// gachthefast gọi callback về đây sau khi xử lý thẻ xong (status=99 lúc gọi
// API ban đầu = đang chờ duyệt). Docs chính thức của platform cho phép chọn
// GET (query params) hoặc POST (JSON body) — "Kiểu" trong config kết nối
// chọn cái nào; tài khoản này đang để GET nên phải hỗ trợ cả hai.
// callback_sign = md5(partnerKey+code+serial). requestId dùng để tìm lại
// topup vì mã đơn của mình không được gửi kèm trong request charging ban đầu.
interface GachthefastCallback {
  status: number | string;
  message?: string;
  declared_value?: number | string;
  card_value?: number | string;
  value?: number | string;
  amount?: number | string;
  code: string;
  serial: string;
  request_id: string;
  telco?: string;
  callback_sign: string;
  trans_id?: number | string;
}

async function handleCallback(data: Record<string, unknown>) {
  const body = data as unknown as GachthefastCallback;

  const integration = await getPaymentIntegrationSettings();
  if (!integration.gachthefastApiKey) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  if (!body.code || !body.serial || !body.request_id) {
    return NextResponse.json({ received: true, mapped: false });
  }

  const expectedSign = computeChargingSign(integration.gachthefastApiKey, String(body.code), String(body.serial));
  if (String(body.callback_sign) !== expectedSign) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const topup = await prisma.topup.findFirst({
    where: { meta: { path: ["gachthefastRequestId"], equals: String(body.request_id) } },
  });
  if (!topup) {
    console.warn("[gachthefast webhook] no topup found for request_id:", body.request_id);
    return NextResponse.json({ received: true, mapped: false });
  }

  try {
    // status 1 = đúng thẻ, 2 = đúng thẻ sai mệnh giá ("value" = mệnh giá
    // thật dùng tính tiền, processTopupWebhook tự đối chiếu với topup.amount
    // và đánh WRONG_VALUE nếu lệch), còn lại (3/4/100) = thất bại.
    const success = Number(body.status) === 1 || Number(body.status) === 2;
    const result = await processTopupWebhook({
      provider: "gachthefast",
      externalEventId: String(body.trans_id ?? `${body.request_id}-cb`),
      topupCode: topup.topupCode,
      success,
      payload: body as unknown as object,
      actualAmount: success && body.value !== undefined ? BigInt(body.value) : undefined,
    });
    return NextResponse.json({ received: true, mapped: true, ...result });
  } catch (err) {
    console.error("[gachthefast webhook] processTopupWebhook failed", err);
    return NextResponse.json({ received: true, mapped: false });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ received: true, mapped: false });
  return handleCallback(body);
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  return handleCallback(params);
}
