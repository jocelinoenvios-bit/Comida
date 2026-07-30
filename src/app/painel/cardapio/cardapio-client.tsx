"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { CATEGORIES_SEED } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  createMenuSection,
  createProduct,
  toggleProductAvailability,
  deleteProduct,
  createAddition,
  deleteAddition,
} from "@/server/actions/merchant";

interface Addition {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promoPrice: number | null;
  isAvailable: boolean;
  isCombo: boolean;
}

interface MenuSection {
  id: string;
  name: string;
  products: Product[];
}

export function CardapioClient({
  establishmentId,
  sections: initialSections,
  additions: initialAdditions,
  productLimit,
  productCount,
}: {
  establishmentId: string;
  sections: MenuSection[];
  additions: Addition[];
  productLimit: number | null;
  productCount: number;
}) {
  const [sections, setSections] = useState(initialSections);
  const [additions, setAdditions] = useState(initialAdditions);
  const [newSectionName, setNewSectionName] = useState("");
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const limitReached = productLimit !== null && productCount >= productLimit;

  function handleAddSection() {
    if (!newSectionName.trim()) return;
    startTransition(async () => {
      const res = await createMenuSection(establishmentId, newSectionName.trim());
      if (res.ok) {
        setSections((s) => [...s, { id: res.sectionId, name: newSectionName.trim(), products: [] }]);
        setNewSectionName("");
      }
    });
  }

  function handleToggleAvailability(productId: string, sectionId: string, isAvailable: boolean) {
    startTransition(async () => {
      await toggleProductAvailability(establishmentId, productId, isAvailable);
      setSections((s) =>
        s.map((sec) =>
          sec.id === sectionId
            ? { ...sec, products: sec.products.map((p) => (p.id === productId ? { ...p, isAvailable } : p)) }
            : sec,
        ),
      );
    });
  }

  function handleDeleteProduct(productId: string, sectionId: string) {
    startTransition(async () => {
      await deleteProduct(establishmentId, productId);
      setSections((s) =>
        s.map((sec) => (sec.id === sectionId ? { ...sec, products: sec.products.filter((p) => p.id !== productId) } : sec)),
      );
    });
  }

  function handleAddAddition(name: string, price: number) {
    startTransition(async () => {
      await createAddition(establishmentId, name, price);
      setAdditions((a) => [...a, { id: crypto.randomUUID(), name, price }]);
    });
  }

  function handleDeleteAddition(id: string) {
    startTransition(async () => {
      await deleteAddition(establishmentId, id);
      setAdditions((a) => a.filter((x) => x.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      {productLimit !== null && (
        <p className="text-sm text-gray-500">
          {productCount}/{productLimit} produtos usados no seu plano.{" "}
          {limitReached && <span className="font-semibold text-brand-600">Faça upgrade para adicionar mais.</span>}
        </p>
      )}

      {sections.map((section) => (
        <div key={section.id} className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-navy-900">{section.name}</h3>
            <button
              onClick={() => setOpenForm(openForm === section.id ? null : section.id)}
              disabled={limitReached}
              className="flex items-center gap-1 text-sm font-bold text-brand-600 disabled:opacity-40"
            >
              <Plus size={15} /> Produto
            </button>
          </div>

          {section.products.length === 0 && openForm !== section.id && (
            <p className="text-sm text-gray-400">Nenhum produto nesta seção ainda.</p>
          )}

          <div className="divide-y divide-gray-50">
            {section.products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <button
                  onClick={() => handleToggleAvailability(p.id, section.id, !p.isAvailable)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    p.isAvailable ? "bg-emerald-500" : "bg-gray-300",
                  )}
                  aria-label="Disponibilidade"
                >
                  <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-transform", p.isAvailable ? "left-6" : "left-1")} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-semibold", p.isAvailable ? "text-navy-900" : "text-gray-400 line-through")}>
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.promoPrice ? `${formatCurrency(p.promoPrice)} (de ${formatCurrency(p.price)})` : formatCurrency(p.price)}
                  </p>
                </div>
                <button onClick={() => handleDeleteProduct(p.id, section.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {openForm === section.id && (
            <NewProductForm
              establishmentId={establishmentId}
              sectionId={section.id}
              additions={additions}
              onCreated={(product) => {
                setSections((s) => s.map((sec) => (sec.id === section.id ? { ...sec, products: [...sec.products, product] } : sec)));
                setOpenForm(null);
              }}
              onError={setError}
            />
          )}
        </div>
      ))}

      <div className="rounded-2xl border border-dashed border-gray-200 p-4">
        <p className="mb-2 text-sm font-bold text-navy-800">Nova seção do cardápio</p>
        <div className="flex gap-2">
          <input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Ex: Bebidas, Sobremesas..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <Button size="sm" onClick={handleAddSection} disabled={pending}>
            Adicionar
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h3 className="mb-3 font-bold text-navy-900">Adicionais</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {additions.map((a) => (
            <span key={a.id} className="flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700">
              {a.name} · {formatCurrency(a.price)}
              <button onClick={() => handleDeleteAddition(a.id)} className="text-navy-400 hover:text-red-500">
                <Trash2 size={12} />
              </button>
            </span>
          ))}
          {additions.length === 0 && <p className="text-sm text-gray-400">Nenhum adicional cadastrado.</p>}
        </div>
        <AdditionForm onSubmit={handleAddAddition} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function NewProductForm({
  establishmentId,
  sectionId,
  additions,
  onCreated,
  onError,
}: {
  establishmentId: string;
  sectionId: string;
  additions: Addition[];
  onCreated: (p: Product) => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [categorySlug, setCategorySlug] = useState(CATEGORIES_SEED[0].slug);
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!name.trim() || !price) return;
    startTransition(async () => {
      const res = await createProduct(establishmentId, {
        menuSectionId: sectionId,
        categorySlug,
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        price: Number(price),
        promoPrice: promoPrice ? Number(promoPrice) : null,
        additionIds: selectedAdditions,
      });
      if (!res.ok) {
        onError(res.message || "Erro ao criar produto.");
        return;
      }
      onCreated({
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        promoPrice: promoPrice ? Number(promoPrice) : null,
        isAvailable: true,
        isCombo: false,
      });
    });
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl bg-gray-50 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do produto" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL da imagem" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Preço" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <input value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} type="number" step="0.01" placeholder="Preço promocional (opcional)" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          {CATEGORIES_SEED.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" rows={2} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      {additions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {additions.map((a) => (
            <label key={a.id} className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs">
              <input
                type="checkbox"
                checked={selectedAdditions.includes(a.id)}
                onChange={() =>
                  setSelectedAdditions((prev) => (prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]))
                }
              />
              {a.name}
            </label>
          ))}
        </div>
      )}
      <Button size="sm" onClick={handleSubmit} disabled={pending}>
        {pending ? "Salvando..." : "Salvar produto"}
      </Button>
    </div>
  );
}

function AdditionForm({ onSubmit }: { onSubmit: (name: string, price: number) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="flex gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do adicional" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="R$" className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (!name.trim()) return;
          onSubmit(name.trim(), Number(price) || 0);
          setName("");
          setPrice("");
        }}
      >
        Adicionar
      </Button>
    </div>
  );
}
