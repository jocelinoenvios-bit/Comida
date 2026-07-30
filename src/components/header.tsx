"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { MapPin, Search, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useHasMounted } from "@/lib/use-mounted";
import { BRAND } from "@/lib/constants";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const itemsCount = useCartStore((s) => s.itemsCount());
  const mounted = useHasMounted();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (q) router.push(`/busca?q=${encodeURIComponent(String(q))}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg font-black text-white">
            B
          </span>
          <span className="hidden text-xl font-black text-navy-900 sm:block">{BRAND.name}</span>
        </Link>

        <button
          onClick={() => router.push("/enderecos")}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-navy-700 hover:text-brand-600 md:flex"
        >
          <MapPin size={16} className="text-brand-500" />
          Varjota, CE
        </button>

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            placeholder="Buscar pizza, X-Bacon, açaí..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand-400 focus:bg-white"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/busca"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-700 hover:bg-navy-50 md:hidden"
            aria-label="Buscar"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/carrinho"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-700 hover:bg-navy-50"
            aria-label="Carrinho"
          >
            <ShoppingBag size={20} />
            {mounted && itemsCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
                {itemsCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <div className="group relative">
              <button className="flex h-10 items-center gap-2 rounded-full pl-1 pr-3 text-sm font-semibold text-navy-800 hover:bg-navy-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-700">
                  <User size={16} />
                </span>
                <span className="hidden max-w-24 truncate sm:inline">{session.user.name}</span>
              </button>
              <div className="invisible absolute right-0 top-full w-48 rounded-xl border border-gray-100 bg-white p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <Link href="/perfil" className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-gray-50">
                  Meu perfil
                </Link>
                <Link href="/pedidos" className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-gray-50">
                  Meus pedidos
                </Link>
                {session.user.role === "MERCHANT" && (
                  <Link href="/painel" className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-gray-50">
                    Painel do comerciante
                  </Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-gray-50">
                    Painel admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/entrar"
              className="rounded-full bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
