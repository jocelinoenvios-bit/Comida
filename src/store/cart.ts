"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartAddition {
  name: string;
  price: number;
}

export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  observations?: string;
  additions: CartAddition[];
}

export interface CartEstablishment {
  id: string;
  slug: string;
  name: string;
  whatsapp: string;
  deliveryFee: number;
}

interface CartState {
  establishment: CartEstablishment | null;
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  setEstablishment: (e: CartEstablishment) => void;
  addItem: (item: Omit<CartItem, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  applyCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  clear: () => void;
  itemsCount: () => number;
  subtotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      establishment: null,
      items: [],
      couponCode: null,
      couponDiscount: 0,

      setEstablishment: (e) => set({ establishment: e }),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, lineId: crypto.randomUUID() }],
        })),

      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.lineId !== lineId)
              : state.items.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
        })),

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      clear: () => set({ establishment: null, items: [], couponCode: null, couponDiscount: 0 }),

      itemsCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (acc, i) => acc + (i.unitPrice + i.additions.reduce((a, add) => a + add.price, 0)) * i.quantity,
          0,
        ),

      total: () => {
        const subtotal = get().subtotal();
        const deliveryFee = get().establishment?.deliveryFee ?? 0;
        const discount = Math.min(get().couponDiscount, subtotal);
        return Math.max(subtotal + deliveryFee - discount, 0);
      },
    }),
    { name: "boraqui-cart" },
  ),
);
