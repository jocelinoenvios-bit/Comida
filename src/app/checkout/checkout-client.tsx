"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useHasMounted } from "@/lib/use-mounted";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_LABELS, PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/server/actions/orders";
import { cn } from "@/lib/cn";

interface AddressOption {
  id: string;
  label: string;
  line: string;
}

export function CheckoutClient({
  addresses,
  customerName,
  customerPhone,
}: {
  addresses: AddressOption[];
  customerName: string;
  customerPhone: string;
}) {
  const cart = useCartStore();
  const router = useRouter();
  const mounted = useHasMounted();
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (mounted && !orderPlaced && (!cart.establishment || cart.items.length === 0)) {
      router.replace("/carrinho");
    }
  }, [mounted, orderPlaced, cart.establishment, cart.items.length, router]);

  if (!mounted || !cart.establishment) return null;

  async function handleSubmit() {
    if (!cart.establishment) return;
    if (!name.trim() || !phone.trim()) {
      setError("Informe seu nome e telefone para contato.");
      return;
    }
    if (addresses.length > 0 && !addressId) {
      setError("Selecione um endereço de entrega.");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await createOrder({
      establishmentId: cart.establishment.id,
      addressId: addressId || null,
      paymentMethod: payment,
      observations: observations.trim() || undefined,
      items: cart.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        observations: i.observations,
        additions: i.additions,
      })),
      subtotal: cart.subtotal(),
      deliveryFee: cart.establishment.deliveryFee,
      discount: cart.couponDiscount,
      total: cart.total(),
      couponCode: cart.couponCode,
    });

    setSubmitting(false);

    if (!res.ok) {
      if (res.requiresLogin) {
        router.push("/entrar?callbackUrl=/checkout");
        return;
      }
      setError(res.message || "Não foi possível enviar o pedido.");
      return;
    }

    setOrderPlaced(true);
    cart.clear();
    router.push(`/pedidos/${res.orderId}?enviar=1`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 pb-28">
      <h1 className="mb-4 text-xl font-extrabold text-navy-900">Finalizar pedido</h1>

      <section className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Seus dados</h2>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-700">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-700">Telefone (WhatsApp)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(88) 99999-0000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Endereço de entrega</h2>
          <Link href="/enderecos?callbackUrl=/checkout" className="flex items-center gap-1 text-xs font-bold text-brand-600">
            <Plus size={14} /> Novo
          </Link>
        </div>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum endereço salvo. Adicione um para continuar.</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  addressId === a.id ? "border-brand-400 bg-brand-50" : "border-gray-100",
                )}
              >
                <input
                  type="radio"
                  name="address"
                  className="mt-1"
                  checked={addressId === a.id}
                  onChange={() => setAddressId(a.id)}
                />
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  <span className="block font-semibold text-navy-900">{a.label}</span>
                  <span className="text-gray-500">{a.line}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Forma de pagamento</h2>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setPayment(m)}
              className={cn(
                "rounded-xl border px-2 py-3 text-center text-sm font-semibold",
                payment === m ? "border-brand-400 bg-brand-50 text-brand-700" : "border-gray-100 text-navy-600",
              )}
            >
              {PAYMENT_LABELS[m]}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Observações do pedido</h2>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={2}
          placeholder="Ponto de referência, troco para..., etc."
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-brand-400"
        />
      </section>

      <section className="mb-4 space-y-1.5 rounded-2xl border border-gray-100 bg-white p-4 text-sm">
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
            <span>Desconto</span>
            <span>-{formatCurrency(cart.couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-navy-900">
          <span>Total</span>
          <span>{formatCurrency(cart.total())}</span>
        </div>
      </section>

      {error && <p className="mb-3 text-sm font-medium text-red-500">{error}</p>}

      <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Enviando..." : "Confirmar e enviar no WhatsApp"}
      </Button>
    </div>
  );
}
