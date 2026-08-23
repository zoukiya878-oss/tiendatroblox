import { createHash } from "crypto";

// gachthefast.com dùng chung nền tảng "/chargingws/v2" với nhiều site đổi
// thẻ cào VN khác (doithe1s.vn, ppay.vn...) — sign = md5(partnerKey+code+serial),
// callback_sign dùng cùng công thức. Không có docs riêng public của
// gachthefast; xác nhận qua support Zalo (endpoint + tham số bắt buộc) và đối
// chiếu code mẫu công khai của nền tảng chung (napcard/napthe.php).
const BASE_URL = "https://gachthefast.com/chargingws/v2";

export interface ChargeCardParams {
  partnerId: string;
  partnerKey: string;
  telco: string;
  code: string;
  serial: string;
  amount: bigint;
  requestId: string;
}

export interface ChargeCardResult {
  status: number;
  message?: string;
  value?: string;
  amount?: string;
}

export function computeChargingSign(partnerKey: string, code: string, serial: string): string {
  return createHash("md5").update(partnerKey + code + serial).digest("hex");
}

export async function chargeCard(params: ChargeCardParams): Promise<ChargeCardResult> {
  const sign = computeChargingSign(params.partnerKey, params.code, params.serial);
  const url = new URL(BASE_URL);
  url.searchParams.set("partner_id", params.partnerId);
  url.searchParams.set("telco", params.telco);
  url.searchParams.set("code", params.code);
  url.searchParams.set("serial", params.serial);
  url.searchParams.set("amount", params.amount.toString());
  url.searchParams.set("request_id", params.requestId);
  url.searchParams.set("sign", sign);
  url.searchParams.set("command", "charging");

  const res = await fetch(url, { method: "GET" });
  return res.json();
}
