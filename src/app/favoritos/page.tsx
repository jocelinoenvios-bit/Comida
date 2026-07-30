import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOpenNow } from "@/lib/hours";
import type { OpeningHours } from "@/lib/constants";
import { EstablishmentCard } from "@/components/establishment-card";

export const metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar?callbackUrl=/favoritos");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      establishment: {
        include: {
          plan: { select: { highlighted: true } },
          categories: { include: { category: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <h1 className="mb-4 text-xl font-extrabold text-navy-900">Favoritos</h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center text-gray-400">
          <Heart size={40} />
          <p className="mt-3 text-sm">Você ainda não favoritou nenhum estabelecimento.</p>
          <Link href="/" className="mt-4 font-semibold text-brand-600">
            Explorar estabelecimentos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ establishment: e }) => {
            const hours = JSON.parse(e.openingHoursJson) as OpeningHours;
            return (
              <EstablishmentCard
                key={e.id}
                data={{
                  slug: e.slug,
                  name: e.name,
                  logoUrl: e.logoUrl,
                  coverUrl: e.coverUrl,
                  ratingAvg: e.ratingAvg,
                  ratingCount: e.ratingCount,
                  deliveryFee: e.deliveryFee,
                  avgDeliveryTimeMin: e.avgDeliveryTimeMin,
                  categoryNames: e.categories.map((c) => c.category.name),
                  isOpen: !e.isPaused && isOpenNow(hours),
                  highlighted: e.plan?.highlighted ?? false,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
