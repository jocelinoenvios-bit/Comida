"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Store, CreditCard, Tags, Image as ImageIcon, Bell } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/cidades", label: "Cidades e bairros", icon: MapPin },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", icon: Store },
  { href: "/admin/planos", label: "Planos", icon: CreditCard },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/notificacoes", label: "Notificações", icon: Bell },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-2 py-2 md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-4">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold",
              active ? "bg-navy-600 text-white" : "text-navy-600 hover:bg-gray-50",
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
