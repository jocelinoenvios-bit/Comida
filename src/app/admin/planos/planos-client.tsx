"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { updatePlan } from "@/server/actions/admin";

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  maxProducts: number | null;
  highlighted: boolean;
  features: string[];
  subscribers: number;
}

export function PlanosClient({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [price, setPrice] = useState(plan.priceMonthly.toString());
  const [maxProducts, setMaxProducts] = useState(plan.maxProducts?.toString() ?? "");
  const [highlighted, setHighlighted] = useState(plan.highlighted);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updatePlan(plan.id, {
        priceMonthly: Number(price) || 0,
        maxProducts: maxProducts ? Number(maxProducts) : null,
        highlighted,
      });
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-navy-900">{plan.name}</h3>
        <span className="text-xs font-semibold text-gray-400">{plan.subscribers} lojas</span>
      </div>
      <ul className="mb-3 space-y-1 text-xs text-gray-500">
        {plan.features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label>
          <span className="mb-1 block text-xs font-medium text-navy-700">Preço/mês (R$)</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="w-full rounded-lg border border-gray-200 px-2 py-1.5" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-navy-700">Limite de produtos</span>
          <input
            value={maxProducts}
            onChange={(e) => setMaxProducts(e.target.value)}
            type="number"
            placeholder="Ilimitado"
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5"
          />
        </label>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs font-medium text-navy-700">
        <input type="checkbox" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} />
        Destaque nas buscas
      </label>
      <p className="mt-2 text-sm font-bold text-brand-600">{formatCurrency(Number(price) || 0)}/mês</p>
      <Button size="sm" className="mt-2" onClick={handleSave} disabled={pending}>
        Salvar
      </Button>
    </div>
  );
}
