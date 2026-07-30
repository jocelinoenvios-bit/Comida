"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCartStore, type CartEstablishment } from "@/store/cart";
import { Button } from "./ui/button";

export interface SheetProduct {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  promoPrice?: number | null;
  additions: { id: string; name: string; price: number }[];
}

export function ProductSheet({
  product,
  establishment,
  onClose,
}: {
  product: SheetProduct;
  establishment: CartEstablishment;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  const cart = useCartStore();
  const basePrice = product.promoPrice ?? product.price;

  const additionsTotal = useMemo(
    () => product.additions.filter((a) => selectedAdditions.includes(a.id)).reduce((s, a) => s + a.price, 0),
    [selectedAdditions, product.additions],
  );
  const total = (basePrice + additionsTotal) * quantity;

  function toggleAddition(id: string) {
    setSelectedAdditions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function commit() {
    cart.setEstablishment(establishment);
    cart.addItem({
      productId: product.id,
      name: product.name,
      unitPrice: basePrice,
      quantity,
      imageUrl: product.imageUrl,
      observations: observations.trim() || undefined,
      additions: product.additions.filter((a) => selectedAdditions.includes(a.id)),
    });
    onClose();
  }

  function handleConfirm() {
    const hasOtherEstablishment =
      cart.establishment && cart.establishment.id !== establishment.id && cart.items.length > 0;
    if (hasOtherEstablishment) {
      setConfirmSwitch(true);
      return;
    }
    commit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="animate-slide-up max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmSwitch ? (
          <div className="p-6 text-center">
            <p className="text-base font-bold text-navy-900">Trocar de estabelecimento?</p>
            <p className="mt-2 text-sm text-gray-500">
              Seu carrinho tem itens de <strong>{cart.establishment?.name}</strong>. Ao continuar, esses itens serão
              removidos.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmSwitch(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  cart.clear();
                  commit();
                }}
              >
                Limpar e continuar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-48 w-full bg-navy-50">
              {product.imageUrl && (
                <Image src={product.imageUrl} alt={product.name} fill sizes="512px" className="object-cover" />
              )}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-navy-900">{product.name}</h3>
              {product.description && <p className="mt-1 text-sm text-gray-500">{product.description}</p>}
              <div className="mt-2 flex items-baseline gap-2">
                {product.promoPrice ? (
                  <>
                    <span className="text-lg font-black text-brand-600">{formatCurrency(product.promoPrice)}</span>
                    <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
                  </>
                ) : (
                  <span className="text-lg font-black text-navy-900">{formatCurrency(product.price)}</span>
                )}
              </div>

              {product.additions.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-bold text-navy-800">Adicionais</p>
                  <div className="space-y-2">
                    {product.additions.map((a) => (
                      <label
                        key={a.id}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 text-sm has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--color-brand-500)]"
                            checked={selectedAdditions.includes(a.id)}
                            onChange={() => toggleAddition(a.id)}
                          />
                          {a.name}
                        </span>
                        <span className="text-gray-500">+{formatCurrency(a.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <p className="mb-2 text-sm font-bold text-navy-800">Alguma observação?</p>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: sem cebola, tirar picles, ponto da carne..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-brand-400"
                />
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-full border border-gray-200 px-3 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-navy-600"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-5 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-navy-600"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button className="flex-1" size="lg" onClick={handleConfirm}>
                  Adicionar · {formatCurrency(total)}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
