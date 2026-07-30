"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/lib/icon";
import { createCategory, deleteCategory } from "@/server/actions/admin";

interface Category {
  id: string;
  name: string;
  icon: string;
  establishmentCount: number;
}

export function CategoriasClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("utensils");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-dashed border-gray-200 p-4">
        <h3 className="mb-2 font-bold text-navy-900">Nova categoria</h3>
        <div className="flex flex-wrap gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Ícone (lucide, ex: pizza)" className="w-48 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                if (!name.trim()) return;
                await createCategory(name.trim(), icon.trim() || "utensils");
                setName("");
                router.refresh();
              })
            }
          >
            Adicionar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3">
            <DynamicIcon name={c.icon} size={18} className="text-brand-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-900">{c.name}</p>
              <p className="text-[11px] text-gray-400">{c.establishmentCount} lojas</p>
            </div>
            <button
              onClick={() =>
                startTransition(async () => {
                  await deleteCategory(c.id);
                  router.refresh();
                })
              }
              className="text-gray-300 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
