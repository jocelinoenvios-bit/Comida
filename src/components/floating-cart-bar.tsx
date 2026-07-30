"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useHasMounted } from "@/lib/use-mounted";
import { formatCurrency } from "@/lib/format";

export function FloatingCartBar({ establishmentId }: { establishmentId: string }) {
  const cart = useCartStore();
  const mounted = useHasMounted();

  if (!mounted) return null;
  if (cart.establishment?.id !== establishmentId || cart.items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-4">
      <Link
        href="/carrinho"
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-brand-500 px-5 py-3.5 text-white shadow-lg shadow-brand-500/30"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag size={18} />
          {cart.itemsCount()} {cart.itemsCount() === 1 ? "item" : "itens"}
        </span>
        <span className="font-bold">Ver carrinho · {formatCurrency(cart.total())}</span>
      </Link>
    </div>
  );
}
