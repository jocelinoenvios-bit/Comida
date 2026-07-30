import { prisma } from "@/lib/prisma";
import { EstabelecimentosClient } from "./estabelecimentos-client";
import type { EstablishmentStatus } from "@/lib/constants";

export const metadata = { title: "Admin — Estabelecimentos" };

export default async function AdminEstabelecimentosPage() {
  const [establishments, plans] = await Promise.all([
    prisma.establishment.findMany({
      include: { city: true, plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.plan.findMany(),
  ]);

  return (
    <EstabelecimentosClient
      establishments={establishments.map((e) => ({
        id: e.id,
        name: e.name,
        city: `${e.city.name}/${e.city.state}`,
        status: e.status as EstablishmentStatus,
        planId: e.planId,
        planName: e.plan?.name ?? "Sem plano",
      }))}
      plans={plans.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
