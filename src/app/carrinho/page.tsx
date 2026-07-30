"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useHasMounted } from "@/lib/use-mounted";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { validateCoupon } from "@/server/actions/coupons";

export default function CartPage() {
  const cart = useCartStore();
  const router = useRouter();
  const mounted = useHasMounted();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  if (!mounted) return null;

  if (!cart.establishment || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <ShoppingBag size={44} className="text-gray-300" />
        <h1 className="mt-4 text-lg font-bold text-navy-900">Seu carrinho está vazio</h1>
        <p className="mt-1 text-sm text-gray-500">Escolha um estabelecimento e monte seu pedido.</p>
        <Link href="/" className="mt-5">
          <Button>Explorar estabelecimentos</Button>
        </Link>
      </div>
    );
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim() || !cart.establishment) return;
    setPending(true);
    setCouponMessage(null);
    const res = await validateCoupon(couponInput, cart.establishment.id, cart.subtotal());
    setPending(false);
    if (!res.ok) {
      setCouponMessage({ type: "error", text: res.message });
      return;
    }
    cart.applyCoupon(res.code, res.discount);
    setCouponMessage({ type: "success", text: `Cupom ${res.code} aplicado!` });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="text-xl font-extrabold text-navy-900">Sua sacola</h1>
      <Link href={`/loja/${cart.establishment.slug}`} className="text-sm font-semibold text-brand-600">
        {cart.establishment.name}
      </Link>

      <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {cart.items.map((item) => (
          <div key={item.lineId} className="flex gap-3 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-50">
              {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-navy-900">{item.name}</p>
                <button onClick={() => cart.removeItem(item.lineId)} aria-label="Remover" className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              {item.additions.length > 0 && (
                <p className="mt-0.5 text-xs text-gray-500">{item.additions.map((a) => a.name).join(", ")}</p>
              )}
              {item.observations && <p className="mt-0.5 text-xs italic text-gray-400">&ldquo;{item.observations}&rdquo;</p>}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-full border border-gray-200 px-2.5 py-1">
                  <button onClick={() => cart.updateQuantity(item.lineId, item.quantity - 1)} aria-label="Diminuir">
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => cart.updateQuantity(item.lineId, item.quantity + 1)} aria-label="Aumentar">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold text-navy-900">
                  {formatCurrency((item.unitPrice + item.additions.reduce((s, a) => s + a.price, 0)) * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-gray-400" />
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Cupom de desconto"
            className="flex-1 border-none text-sm outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={pending}
            className="text-sm font-bold text-brand-600 disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
        {couponMessage && (
          <p className={`mt-1 text-xs ${couponMessage.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
            {couponMessage.text}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-1.5 rounded-2xl border border-gray-100 bg-white p-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.subtotal())}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Taxa de entrega</span>
          <span>{formatCurrency(cart.establishment.deliveryFee)}</span>
        </div>
        {cart.couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Desconto ({cart.couponCode})</span>
            <span>-{formatCurrency(cart.couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-navy-900">
          <span>Total</span>
          <span>{formatCurrency(cart.total())}</span>
        </div>
      </div>

      <Button size="lg" className="mt-4 w-full" onClick={() => router.push("/checkout")}>
        Ir para pagamento
      </Button>
    </div>
  );
}
