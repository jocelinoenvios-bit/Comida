import { prisma } from "@/lib/prisma";
import { PlanosClient } from "./planos-client";

export const metadata = { title: "Admin — Planos" };

export default async function AdminPlanosPage() {
  const plans = await prisma.plan.findMany({ include: { establishments: { select: { id: true } } } });

  return (
    <PlanosClient
      plans={plans.map((p) => ({
        id: p.id,
        name: p.name,
        priceMonthly: p.priceMonthly,
        maxProducts: p.maxProducts,
        highlighted: p.highlighted,
        features: JSON.parse(p.featuresJson) as string[],
        subscribers: p.establishments.length,
      }))}
    />
  );
}
