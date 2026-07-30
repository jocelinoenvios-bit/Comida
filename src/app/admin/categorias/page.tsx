import { prisma } from "@/lib/prisma";
import { CategoriasClient } from "./categorias-client";

export const metadata = { title: "Admin — Categorias" };

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { establishments: { select: { establishmentId: true } } },
  });

  return (
    <CategoriasClient
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        establishmentCount: c.establishments.length,
      }))}
    />
  );
}
