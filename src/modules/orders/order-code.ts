import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nano = customAlphabet(alphabet, 6);

export function generateOrderCode(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `ORD-${y}${m}${d}-${nano()}`;
}

export function generateTopupCode(): string {
  return `ROBO${nano()}`;
}
