import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CouponForm } from "../coupon-form";
import { upsertCouponAction } from "../actions";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Sửa coupon: {coupon.code}</h1>
      <CouponForm action={upsertCouponAction.bind(null, id)} coupon={coupon} />
    </div>
  );
}
