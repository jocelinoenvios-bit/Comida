import { getLaunchCity, searchCatalog } from "@/server/queries";
import { EstablishmentCard } from "@/components/establishment-card";
import { ProductSearchCard } from "@/components/product-search-card";
import { SearchBox } from "./search-box";
import { Search as SearchIcon } from "lucide-react";

export const metadata = { title: "Buscar" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const city = await getLaunchCity();
  const results = q ? await searchCatalog(city.id, q) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <SearchBox initialQuery={q} />

      {!q && (
        <div className="mt-16 flex flex-col items-center text-center text-gray-400">
          <SearchIcon size={40} />
          <p className="mt-3 max-w-xs text-sm">
            Busque por pratos como <strong>pizza</strong>, <strong>X-Bacon</strong>, <strong>açaí</strong> ou pelo
            nome do estabelecimento.
          </p>
        </div>
      )}

      {results && results.products.length === 0 && results.establishments.length === 0 && (
        <p className="mt-10 text-center text-sm text-gray-500">
          Nenhum resultado para &ldquo;{q}&rdquo; em Varjota ainda.
        </p>
      )}

      {results && results.establishments.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Estabelecimentos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.establishments.map((e) => (
              <EstablishmentCard key={e.slug} data={e} />
            ))}
          </div>
        </div>
      )}

      {results && results.products.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Produtos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.products.map((p) => (
              <ProductSearchCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                promoPrice={p.promoPrice}
                imageUrl={p.imageUrl}
                establishmentSlug={p.establishment.slug}
                establishmentName={p.establishment.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
