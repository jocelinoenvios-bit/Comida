import { requireMerchantEstablishment } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_LABELS, type PaymentMethod } from "@/lib/constants";

export const metadata = { title: "Relatórios" };

export default async function PainelRelatoriosPage() {
  const { establishment } = await requireMerchantEstablishment();

  const orders = await prisma.order.findMany({
    where: { establishmentId: establishment.id },
    select: { total: true, paymentMethod: true, customerId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const topProducts = await prisma.product.findMany({
    where: { establishmentId: establishment.id },
    orderBy: { soldCount: "desc" },
    take: 10,
  });

  const byPayment = new Map<string, { count: number; total: number }>();
  for (const o of orders) {
    const entry = byPayment.get(o.paymentMethod) ?? { count: 0, total: 0 };
    entry.count++;
    entry.total += o.total;
    byPayment.set(o.paymentMethod, entry);
  }

  const customerOrderCounts = new Map<string, number>();
  for (const o of orders) customerOrderCounts.set(o.customerId, (customerOrderCounts.get(o.customerId) ?? 0) + 1);
  const recurring = [...customerOrderCounts.values()].filter((c) => c > 1).length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pedidos" value={orders.length.toString()} />
        <StatCard label="Faturamento estimado" value={formatCurrency(revenue)} />
        <StatCard label="Clientes recorrentes" value={recurring.toString()} />
        <StatCard label="Ticket médio" value={formatCurrency(orders.length ? revenue / orders.length : 0)} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Produtos mais vendidos</h2>
        <div className="divide-y divide-gray-100">
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-navy-800">
                {i + 1}. {p.name}
              </span>
              <span className="font-bold text-navy-900">{p.soldCount} vendidos</span>
            </div>
          ))}
          {topProducts.length === 0 && <p className="text-sm text-gray-400">Sem dados ainda.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Pedidos por forma de pagamento</h2>
        <div className="divide-y divide-gray-100">
          {[...byPayment.entries()].map(([method, data]) => (
            <div key={method} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-navy-800">{PAYMENT_LABELS[method as PaymentMethod]}</span>
              <span className="text-gray-500">
                {data.count} pedidos · {formatCurrency(data.total)}
              </span>
            </div>
          ))}
          {byPayment.size === 0 && <p className="text-sm text-gray-400">Sem dados ainda.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-xl font-black text-navy-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
