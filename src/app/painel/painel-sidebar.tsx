"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Clock, UtensilsCrossed, Ticket, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/loja", label: "Minha loja", icon: Store },
  { href: "/painel/horario", label: "Horário", icon: Clock },
  { href: "/painel/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/painel/cupons", label: "Cupons", icon: Ticket },
  { href: "/painel/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function PainelSidebar() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-2 py-2 md:w-56 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-4">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/painel" ? pathname === "/painel" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold",
              active ? "bg-brand-50 text-brand-700" : "text-navy-600 hover:bg-gray-50",
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
