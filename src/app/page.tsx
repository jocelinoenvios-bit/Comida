import { prisma } from "@/lib/prisma";
import { CATEGORIES_SEED, BRAND } from "@/lib/constants";
import {
  getLaunchCity,
  getFeaturedEstablishments,
  getFastDeliveryEstablishments,
  getNewEstablishments,
} from "@/server/queries";
import { Section, HScroll } from "@/components/section";
import { CategoryChip } from "@/components/category-chip";
import { EstablishmentCard } from "@/components/establishment-card";
import { BannerCarousel } from "@/components/banner-carousel";
import { Ticket } from "lucide-react";

// Sem isso, o Next tenta pré-renderizar a home no build (dados do Postgres não são
// detectados como "dinâmicos" automaticamente como com fetch()) — quebra em builds
// contra um banco recém-migrado e ainda vazio, e não reflete banners/estabelecimentos
// novos sem um rebuild.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const city = await getLaunchCity();

  const [banners, featured, fast, recent, coupons] = await Promise.all([
    prisma.banner.findMany({
      where: { isActive: true, OR: [{ cityId: city.id }, { cityId: null }] },
      orderBy: { order: "asc" },
    }),
    getFeaturedEstablishments(city.id),
    getFastDeliveryEstablishments(city.id),
    getNewEstablishments(city.id),
    prisma.coupon.findMany({
      where: { isActive: true, establishment: { cityId: city.id, status: "APPROVED" } },
      include: { establishment: { select: { name: true, slug: true } } },
      take: 6,
    }),
  ]);

  return (
    <div className="pb-6">
      <div className="bg-gradient-to-b from-brand-50 to-transparent pb-2">
        <div className="mx-auto max-w-6xl px-4 pt-5">
          <h1 className="text-2xl font-black text-navy-900 sm:text-3xl">
            {BRAND.tagline.split("?")[0]}? <span className="text-brand-500">{BRAND.name}!</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Todo o delivery de {city.name}/{city.state} em um só lugar. Peça e finalize direto no WhatsApp do
            estabelecimento.
          </p>
        </div>
        <BannerCarousel banners={banners} />
      </div>

      <Section title="Categorias">
        <HScroll>
          {CATEGORIES_SEED.map((c) => (
            <CategoryChip key={c.slug} slug={c.slug} name={c.name} icon={c.icon} />
          ))}
        </HScroll>
      </Section>

      {coupons.length > 0 && (
        <Section title="Cupons de desconto" subtitle="Aproveite antes que acabe">
          <HScroll>
            {coupons.map((c) => (
              <div
                key={c.id}
                className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Ticket size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy-900">
                    {c.type === "PERCENT" ? `${c.value}% OFF` : `${c.value} OFF`} · {c.code}
                  </p>
                  <p className="truncate text-xs text-gray-600">{c.establishment?.name}</p>
                </div>
              </div>
            ))}
          </HScroll>
        </Section>
      )}

      <Section title="Destaques em Varjota" subtitle="Estabelecimentos em evidência" href="/categoria/outros">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((e) => (
            <EstablishmentCard key={e.slug} data={e} />
          ))}
        </div>
      </Section>

      <Section title="Entrega rápida" subtitle="Pedidos em até 35 minutos">
        <HScroll>
          {fast.map((e) => (
            <EstablishmentCard key={e.slug} data={e} className="w-72 shrink-0" />
          ))}
        </HScroll>
      </Section>

      <Section title="Novidades" subtitle="Chegou agora no Boraqui">
        <HScroll>
          {recent.map((e) => (
            <EstablishmentCard key={e.slug} data={e} className="w-72 shrink-0" />
          ))}
        </HScroll>
      </Section>
    </div>
  );
}
