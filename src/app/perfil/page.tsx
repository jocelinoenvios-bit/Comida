import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, ShoppingBag, Heart, LayoutDashboard, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";

export const metadata = { title: "Meu perfil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/perfil");

  const links = [
    { href: "/pedidos", label: "Meus pedidos", icon: ShoppingBag },
    { href: "/enderecos", label: "Meus endereços", icon: MapPin },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
  ];

  if (session.user.role === "MERCHANT") {
    links.push({ href: "/painel", label: "Painel do comerciante", icon: LayoutDashboard });
  }
  if (session.user.role === "ADMIN") {
    links.push({ href: "/admin", label: "Painel administrativo", icon: ShieldCheck });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-600">
          {session.user.name?.charAt(0).toUpperCase() ?? "B"}
        </div>
        <div>
          <p className="font-bold text-navy-900">{session.user.name}</p>
          <p className="text-sm text-gray-500">{session.user.email || session.user.phone}</p>
        </div>
      </div>

      <div className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 font-semibold text-navy-800 hover:border-brand-200"
          >
            <Icon size={18} className="text-brand-500" />
            {label}
          </Link>
        ))}
      </div>

      <SignOutButton />
    </div>
  );
}
