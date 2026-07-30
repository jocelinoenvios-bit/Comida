"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAddress } from "@/server/actions/addresses";
import { Button } from "@/components/ui/button";

export function AddressForm({
  cityId,
  neighborhoods,
  callbackUrl,
}: {
  cityId: string;
  neighborhoods: { id: string; name: string }[];
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    label: "Casa",
    street: "",
    number: "",
    complement: "",
    reference: "",
    neighborhoodId: neighborhoods[0]?.id ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createAddress({ ...form, cityId, isDefault: true });
      if (res.requiresLogin) {
        router.push("/entrar");
        return;
      }
      router.push(callbackUrl || "/enderecos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 text-sm">
          <span className="mb-1 block font-medium text-navy-700">Identificação</span>
          <select
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
          >
            <option>Casa</option>
            <option>Trabalho</option>
            <option>Outro</option>
          </select>
        </label>
        <label className="col-span-2 text-sm sm:col-span-1">
          <span className="mb-1 block font-medium text-navy-700">Rua</span>
          <input
            required
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-700">Número</span>
          <input
            required
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-700">Bairro</span>
          <select
            value={form.neighborhoodId}
            onChange={(e) => setForm({ ...form, neighborhoodId: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
          >
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 text-sm sm:col-span-1">
          <span className="mb-1 block font-medium text-navy-700">Complemento</span>
          <input
            value={form.complement}
            onChange={(e) => setForm({ ...form, complement: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
          />
        </label>
        <label className="col-span-2 text-sm">
          <span className="mb-1 block font-medium text-navy-700">Ponto de referência</span>
          <input
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
          />
        </label>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Salvar endereço"}
      </Button>
    </form>
  );
}
