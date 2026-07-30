import { requireMerchantEstablishment } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { CuponsClient } from "./cupons-client";

export const metadata = { title: "Cupons" };

export default async function PainelCuponsPage() {
  const { establishment } = await requireMerchantEstablishment();
  const coupons = await prisma.coupon.findMany({ where: { establishmentId: establishment.id } });

  return (
    <CuponsClient
      establishmentId={establishment.id}
      coupons={coupons.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type as "PERCENT" | "FIXED",
        value: c.value,
        minOrderValue: c.minOrderValue,
        isActive: c.isActive,
        usedCount: c.usedCount,
      }))}
    />
  );
}
