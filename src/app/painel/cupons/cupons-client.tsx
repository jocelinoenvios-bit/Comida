"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/server/actions/merchant";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderValue: number;
  isActive: boolean;
  usedCount: number;
}

export function CuponsClient({ establishmentId, coupons: initial }: { establishmentId: string; coupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initial);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    if (!code.trim() || !value) return;
    startTransition(async () => {
      const res = await createCoupon(establishmentId, {
        code: code.trim(),
        type,
        value: Number(value),
        minOrderValue: Number(minOrderValue) || 0,
      });
      if (!res.ok) {
        setError(res.message || "Erro ao criar cupom.");
        return;
      }
      setError("");
      setCoupons((c) => [
        ...c,
        { id: crypto.randomUUID(), code: code.trim().toUpperCase(), type, value: Number(value), minOrderValue: Number(minOrderValue) || 0, isActive: true, usedCount: 0 },
      ]);
      setCode("");
      setValue("");
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h3 className="mb-3 font-bold text-navy-900">Novo cupom</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="PERCENT">% Percentual</option>
            <option value="FIXED">R$ Fixo</option>
          </select>
          <input value={value} onChange={(e) => setValue(e.target.value)} type="number" placeholder="Valor" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} type="number" placeholder="Pedido mínimo" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <Button size="sm" className="mt-3" onClick={handleCreate} disabled={pending}>
          Criar cupom
        </Button>
      </div>

      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
            <div>
              <p className="font-bold text-navy-900">{c.code}</p>
              <p className="text-xs text-gray-500">
                {c.type === "PERCENT" ? `${c.value}% OFF` : `R$${c.value} OFF`} · pedido mín. R${c.minOrderValue} · usado {c.usedCount}x
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  startTransition(async () => {
                    await toggleCoupon(establishmentId, c.id, !c.isActive);
                    setCoupons((list) => list.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
                  })
                }
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", c.isActive ? "bg-emerald-500" : "bg-gray-300")}
              >
                <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-transform", c.isActive ? "left-6" : "left-1")} />
              </button>
              <button
                onClick={() =>
                  startTransition(async () => {
                    await deleteCoupon(establishmentId, c.id);
                    setCoupons((list) => list.filter((x) => x.id !== c.id));
                  })
                }
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-gray-400">Nenhum cupom criado ainda.</p>}
      </div>
    </div>
  );
}
