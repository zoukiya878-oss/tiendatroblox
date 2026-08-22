import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

export class CouponError extends Error {}

export async function validateAndComputeDiscount(
  tx: Tx,
  params: { code: string; userId: string; subtotal: bigint }
): Promise<{ couponId: string; discount: bigint }> {
  const { code, userId, subtotal } = params;

  const coupon = await tx.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) throw new CouponError("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hoá");

  const now = new Date();
  if (coupon.startAt && now < coupon.startAt) throw new CouponError("Mã giảm giá chưa bắt đầu");
  if (coupon.endAt && now > coupon.endAt) throw new CouponError("Mã giảm giá đã hết hạn");

  if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
    throw new CouponError("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã");
  }

  if (coupon.usageLimit !== null) {
    const totalUsed = await tx.couponUsage.count({ where: { couponId: coupon.id } });
    if (totalUsed >= coupon.usageLimit) throw new CouponError("Mã giảm giá đã hết lượt sử dụng");
  }

  if (coupon.usagePerUser !== null) {
    const usedByUser = await tx.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (usedByUser >= coupon.usagePerUser) throw new CouponError("Bạn đã sử dụng hết lượt cho mã này");
  }

  let discount =
    coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100n : coupon.value;

  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount;
  }
  if (discount > subtotal) discount = subtotal;

  return { couponId: coupon.id, discount };
}
