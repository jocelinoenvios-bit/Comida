import { prisma } from "@/lib/prisma";
import { BannersClient } from "./banners-client";

export const metadata = { title: "Admin — Banners" };

export default async function AdminBannersPage() {
  const [banners, cities] = await Promise.all([
    prisma.banner.findMany({ include: { city: true }, orderBy: { order: "asc" } }),
    prisma.city.findMany(),
  ]);

  return (
    <BannersClient
      banners={banners.map((b) => ({
        id: b.id,
        title: b.title,
        imageUrl: b.imageUrl,
        isActive: b.isActive,
        cityName: b.city ? `${b.city.name}/${b.city.state}` : "Todas as cidades",
      }))}
      cities={cities.map((c) => ({ id: c.id, name: `${c.name}/${c.state}` }))}
    />
  );
}
