"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCartStore } from "@/store/cart";
import { useHasMounted } from "@/lib/use-mounted";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/busca", label: "Buscar", icon: Search },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingBag },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemsCount = useCartStore((s) => s.itemsCount());
  const mounted = useHasMounted();

  if (pathname.startsWith("/painel") || pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                active ? "text-brand-600" : "text-gray-400",
              )}
            >
              <Icon size={21} className={active ? "fill-brand-100" : ""} />
              {label}
              {href === "/carrinho" && mounted && itemsCount > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                  {itemsCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
