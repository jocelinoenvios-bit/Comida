"use client";

import { useState, useTransition } from "react";
import { CATEGORIES_SEED } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { updateEstablishmentProfile, togglePause } from "@/server/actions/merchant";
import { cn } from "@/lib/cn";

interface Props {
  establishmentId: string;
  initial: {
    name: string;
    description: string;
    logoUrl: string;
    coverUrl: string;
    whatsapp: string;
    instagram: string;
    pixKey: string;
    deliveryFee: number;
    avgDeliveryTimeMin: number;
    serviceAreaNote: string;
    categorySlugs: string[];
    isPaused: boolean;
  };
}

export function CompanyForm({ establishmentId, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function toggleCategory(slug: string) {
    setForm((f) => ({
      ...f,
      categorySlugs: f.categorySlugs.includes(slug)
        ? f.categorySlugs.filter((s) => s !== slug)
        : [...f.categorySlugs, slug],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateEstablishmentProfile(establishmentId, form);
      setMessage(res.ok ? "Dados salvos com sucesso!" : res.message || "Erro ao salvar.");
      setTimeout(() => setMessage(""), 3000);
    });
  }

  function handleTogglePause() {
    startTransition(async () => {
      await togglePause(establishmentId, !form.isPaused);
      setForm((f) => ({ ...f, isPaused: !f.isPaused }));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
        <div>
          <p className="font-bold text-navy-900">Loja {form.isPaused ? "fechada temporariamente" : "aberta para pedidos"}</p>
          <p className="text-sm text-gray-500">Use para férias ou pausas rápidas — o horário normal continua salvo.</p>
        </div>
        <button
          onClick={handleTogglePause}
          disabled={pending}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
            form.isPaused ? "bg-gray-300" : "bg-emerald-500",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
              form.isPaused ? "left-1" : "left-6",
            )}
          />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-700">Nome da empresa</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-700">WhatsApp (com DDD)</span>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="col-span-2 text-sm">
            <span className="mb-1 block font-medium text-navy-700">Descrição</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <ImageUploadField
            label="Logo"
            value={form.logoUrl}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
            aspectClassName="aspect-square"
          />
          <ImageUploadField
            label="Foto da fachada"
            value={form.coverUrl}
            onChange={(url) => setForm({ ...form, coverUrl: url })}
            aspectClassName="aspect-video"
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-700">Instagram</span>
            <input
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="@minhaloja"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-700">Chave PIX</span>
            <input
              value={form.pixKey}
              onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-700">Taxa de entrega (R$)</span>
            <input
              type="number"
              step="0.01"
              value={form.deliveryFee}
              onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-700">Tempo médio de entrega (min)</span>
            <input
              type="number"
              value={form.avgDeliveryTimeMin}
              onChange={(e) => setForm({ ...form, avgDeliveryTimeMin: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="col-span-2 text-sm">
            <span className="mb-1 block font-medium text-navy-700">Área de atendimento</span>
            <input
              value={form.serviceAreaNote}
              onChange={(e) => setForm({ ...form, serviceAreaNote: e.target.value })}
              placeholder="Ex: Entregamos em todo o Centro e Bela Vista"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-navy-700">Categorias</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES_SEED.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => toggleCategory(c.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  form.categorySlugs.includes(c.slug)
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
