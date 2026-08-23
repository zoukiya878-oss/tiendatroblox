// All money amounts are integer VND stored as BigInt. Never use float for money.

export function formatVnd(amount: bigint | number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(amount)) + "đ";
}

export function toBigIntVnd(value: number | string): bigint {
  const cleaned = typeof value === "string" ? value.replace(/,/g, "") : value;
  const n = Math.round(Number(cleaned));
  if (!Number.isFinite(n) || n < 0) throw new Error("Invalid money amount");
  return BigInt(n);
}

export function maskUsername(username: string): string {
  if (username.length <= 3) return username[0] + "***";
  return username.slice(0, 3) + "***";
}
