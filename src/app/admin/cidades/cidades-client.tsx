"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createCity, toggleCityActive, createNeighborhood, deleteNeighborhood } from "@/server/actions/admin";
import { useRouter } from "next/navigation";

interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  neighborhoods: { id: string; name: string }[];
}

export function CidadesClient({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [pending, startTransition] = useTransition();
  const [newNeighborhood, setNewNeighborhood] = useState<Record<string, string>>({});

  function handleCreateCity() {
    if (!name.trim() || !state.trim()) return;
    startTransition(async () => {
      await createCity(name.trim(), state.trim());
      setName("");
      setState("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-gray-200 p-4">
        <h3 className="mb-2 font-bold text-navy-900">Cadastrar nova cidade</h3>
        <div className="flex flex-wrap gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da cidade" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="UF" maxLength={2} className="w-16 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <Button size="sm" onClick={handleCreateCity} disabled={pending}>
            Adicionar
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          A arquitetura do Boraqui já está pronta para expandir para centenas de cidades — cada nova cidade herda
          categorias e planos automaticamente.
        </p>
      </div>

      {cities.map((city) => (
        <div key={city.id} className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy-900">
                {city.name}/{city.state}
              </h3>
              <p className="text-xs text-gray-500">{city.neighborhoods.length} bairros cadastrados</p>
            </div>
            <button
              onClick={() =>
                startTransition(async () => {
                  await toggleCityActive(city.id, !city.isActive);
                  router.refresh();
                })
              }
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold",
                city.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500",
              )}
            >
              {city.isActive ? "Ativa" : "Inativa"}
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {city.neighborhoods.map((n) => (
              <span key={n.id} className="flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">
                {n.name}
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await deleteNeighborhood(n.id);
                      router.refresh();
                    })
                  }
                  className="text-navy-400 hover:text-red-500"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newNeighborhood[city.id] ?? ""}
              onChange={(e) => setNewNeighborhood((n) => ({ ...n, [city.id]: e.target.value }))}
              placeholder="Novo bairro"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                startTransition(async () => {
                  const value = newNeighborhood[city.id];
                  if (!value?.trim()) return;
                  await createNeighborhood(city.id, value.trim());
                  setNewNeighborhood((n) => ({ ...n, [city.id]: "" }));
                  router.refresh();
                })
              }
            >
              Adicionar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
