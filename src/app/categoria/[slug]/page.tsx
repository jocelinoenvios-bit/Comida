import { notFound } from "next/navigation";
import { CATEGORIES_SEED } from "@/lib/constants";
import { getLaunchCity, getEstablishmentsByCategory } from "@/server/queries";
import { EstablishmentCard } from "@/components/establishment-card";
import { CategoryChip } from "@/components/category-chip";
import { HScroll } from "@/components/section";

export async function generateStaticParams() {
  return CATEGORIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES_SEED.find((c) => c.slug === slug);
  return { title: category ? category.name : "Categoria" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES_SEED.find((c) => c.slug === slug);
  if (!category) notFound();

  const city = await getLaunchCity();
  const establishments = await getEstablishmentsByCategory(city.id, slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="mb-4">
        <HScroll>
          {CATEGORIES_SEED.map((c) => (
            <CategoryChip key={c.slug} slug={c.slug} name={c.name} icon={c.icon} active={c.slug === slug} />
          ))}
        </HScroll>
      </div>

      <h1 className="text-xl font-extrabold text-navy-900">{category.name}</h1>
      <p className="mb-4 text-sm text-gray-500">
        {establishments.length} estabelecimento{establishments.length === 1 ? "" : "s"} em Varjota
      </p>

      {establishments.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500">
          Ainda não temos estabelecimentos de {category.name.toLowerCase()} cadastrados em Varjota.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {establishments.map((e) => (
            <EstablishmentCard key={e.slug} data={e} />
          ))}
        </div>
      )}
    </div>
  );
}
