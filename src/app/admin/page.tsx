import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Users, ShoppingBag, Store, DollarSign } from "lucide-react";

export const metadata = { title: "Admin — Visão geral" };

export default async function AdminDashboard() {
  const [userCount, orderCount, establishments, plans] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.establishment.findMany({
      where: { status: "APPROVED" },
      orderBy: { ordersCount: "desc" },
      take: 10,
      include: { plan: true },
    }),
    prisma.plan.findMany({ include: { establishments: { where: { status: { not: "SUSPENDED" } }, select: { id: true } } } }),
  ]);

  const platformRevenue = plans.reduce((sum, p) => sum + p.priceMonthly * p.establishments.length, 0);

  const stats = [
    { label: "Usuários cadastrados", value: userCount.toString(), icon: Users },
    { label: "Pedidos realizados", value: orderCount.toString(), icon: ShoppingBag },
    { label: "Estabelecimentos ativos", value: establishments.length.toString(), icon: Store },
    { label: "Receita de planos (MRR)", value: formatCurrency(platformRevenue), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4">
            <Icon size={18} className="mb-2 text-navy-600" />
            <p className="text-xl font-black text-navy-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Ranking de estabelecimentos</h2>
        <div className="divide-y divide-gray-100">
          {establishments.map((e, i) => (
            <Link
              key={e.id}
              href={`/loja/${e.slug}`}
              className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600"
            >
              <span className="flex items-center gap-2 font-medium text-navy-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-50 text-xs font-bold text-navy-600">
                  {i + 1}
                </span>
                {e.name} <span className="text-xs text-gray-400">· {e.plan?.name ?? "Sem plano"}</span>
              </span>
              <span className="font-bold text-navy-900">{e.ordersCount} pedidos</span>
            </Link>
          ))}
          {establishments.length === 0 && <p className="text-sm text-gray-400">Nenhum estabelecimento aprovado ainda.</p>}
        </div>
      </div>
    </div>
  );
}
