import { prisma } from "@/lib/prisma";
import { isOpenNow } from "@/lib/hours";
import type { OpeningHours } from "@/lib/constants";
import type { EstablishmentCardData } from "@/components/establishment-card";

const LAUNCH_CITY_SLUG = "varjota-ce";

export async function getLaunchCity() {
  return prisma.city.findUniqueOrThrow({ where: { slug: LAUNCH_CITY_SLUG } });
}

function toCardData(est: {
  slug: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
  deliveryFee: number;
  avgDeliveryTimeMin: number;
  openingHoursJson: string;
  isPaused: boolean;
  plan: { highlighted: boolean } | null;
  categories: { category: { name: string } }[];
}): EstablishmentCardData {
  const hours = JSON.parse(est.openingHoursJson) as OpeningHours;
  return {
    slug: est.slug,
    name: est.name,
    logoUrl: est.logoUrl,
    coverUrl: est.coverUrl,
    ratingAvg: est.ratingAvg,
    ratingCount: est.ratingCount,
    deliveryFee: est.deliveryFee,
    avgDeliveryTimeMin: est.avgDeliveryTimeMin,
    categoryNames: est.categories.map((c) => c.category.name),
    isOpen: !est.isPaused && isOpenNow(hours),
    highlighted: est.plan?.highlighted ?? false,
  };
}

const cardInclude = {
  plan: { select: { highlighted: true } },
  categories: { include: { category: { select: { name: true } } } },
} as const;

export async function getFeaturedEstablishments(cityId: string, take = 8) {
  const list = await prisma.establishment.findMany({
    where: { cityId, status: "APPROVED" },
    include: cardInclude,
    orderBy: [{ plan: { highlighted: "desc" } }, { ratingAvg: "desc" }],
    take,
  });
  return list.map(toCardData);
}

export async function getFastDeliveryEstablishments(cityId: string, take = 8) {
  const list = await prisma.establishment.findMany({
    where: { cityId, status: "APPROVED", avgDeliveryTimeMin: { lte: 35 } },
    include: cardInclude,
    orderBy: { avgDeliveryTimeMin: "asc" },
    take,
  });
  return list.map(toCardData);
}

export async function getNewEstablishments(cityId: string, take = 8) {
  const list = await prisma.establishment.findMany({
    where: { cityId, status: "APPROVED" },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return list.map(toCardData);
}

export async function getEstablishmentsByCategory(cityId: string, categorySlug: string) {
  const list = await prisma.establishment.findMany({
    where: {
      cityId,
      status: "APPROVED",
      categories: { some: { category: { slug: categorySlug } } },
    },
    include: cardInclude,
    orderBy: [{ plan: { highlighted: "desc" } }, { ratingAvg: "desc" }],
  });
  return list.map(toCardData);
}

export async function searchCatalog(cityId: string, query: string) {
  const q = query.trim();
  if (!q) return { establishments: [], products: [] };

  const [establishments, products] = await Promise.all([
    prisma.establishment.findMany({
      where: { cityId, status: "APPROVED", name: { contains: q } },
      include: cardInclude,
      take: 10,
    }),
    prisma.product.findMany({
      where: {
        isAvailable: true,
        name: { contains: q },
        establishment: { cityId, status: "APPROVED" },
      },
      include: { establishment: { include: cardInclude } },
      take: 20,
    }),
  ]);

  return {
    establishments: establishments.map(toCardData),
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      promoPrice: p.promoPrice,
      imageUrl: p.imageUrl,
      establishment: toCardData(p.establishment),
    })),
  };
}

export async function getEstablishmentBySlug(slug: string) {
  return prisma.establishment.findUnique({
    where: { slug },
    include: {
      city: true,
      neighborhood: true,
      plan: true,
      categories: { include: { category: true } },
      menuSections: {
        orderBy: { order: "asc" },
        include: {
          products: {
            where: { isAvailable: true },
            include: { additions: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { customer: { select: { name: true, image: true } } },
      },
    },
  });
}
