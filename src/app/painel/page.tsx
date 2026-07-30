import { requireMerchantEstablishment } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { ShoppingBag, DollarSign, Users, TrendingUp } from "lucide-react";

export const metadata = { title: "Painel do comerciante" };

export default async function PainelDashboard() {
  const { establishment } = await requireMerchantEstablishment();

  const [orders, topProducts] = await Promise.all([
    prisma.order.findMany({ where: { establishmentId: establishment.id }, select: { total: true, customerId: true } }),
    prisma.product.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { soldCount: "desc" },
      take: 5,
    }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const customerCounts = new Map<string, number>();
  for (const o of orders) customerCounts.set(o.customerId, (customerCounts.get(o.customerId) ?? 0) + 1);
  const recurringCustomers = [...customerCounts.values()].filter((c) => c > 1).length;

  const stats = [
    { label: "Pedidos totais", value: establishment.ordersCount.toString(), icon: ShoppingBag },
    { label: "Faturamento estimado", value: formatCurrency(revenue), icon: DollarSign },
    { label: "Clientes recorrentes", value: recurringCustomers.toString(), icon: Users },
    { label: "Avaliação média", value: establishment.ratingAvg.toFixed(1), icon: TrendingUp },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4">
            <Icon size={18} className="mb-2 text-brand-500" />
            <p className="text-xl font-black text-navy-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Produtos mais vendidos</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma venda registrada ainda.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2 font-medium text-navy-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-50 text-xs font-bold text-navy-600">
                    {i + 1}
                  </span>
                  {p.name}
                </span>
                <span className="font-bold text-navy-900">{p.soldCount} vendidos</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
        <StarRatingDisplay value={establishment.ratingAvg} count={establishment.ratingCount} size={18} />
        <span className="text-sm text-gray-500">com base nas avaliações dos clientes</span>
      </div>
    </div>
  );
}
