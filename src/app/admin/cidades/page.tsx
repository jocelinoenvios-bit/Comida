import { prisma } from "@/lib/prisma";
import { CidadesClient } from "./cidades-client";

export const metadata = { title: "Admin — Cidades" };

export default async function AdminCidadesPage() {
  const cities = await prisma.city.findMany({
    include: { neighborhoods: { orderBy: { name: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return <CidadesClient cities={cities} />;
}
