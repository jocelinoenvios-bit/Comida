"use server";

import { prisma } from "@/lib/prisma";

export async function validateCoupon(code: string, establishmentId: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.isActive) return { ok: false as const, message: "Cupom inválido." };
  if (coupon.establishmentId && coupon.establishmentId !== establishmentId) {
    return { ok: false as const, message: "Cupom não é válido para este estabelecimento." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { ok: false as const, message: "Cupom expirado." };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { ok: false as const, message: "Cupom esgotado." };
  }
  if (subtotal < coupon.minOrderValue) {
    return {
      ok: false as const,
      message: `Pedido mínimo de ${coupon.minOrderValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para usar este cupom.`,
    };
  }

  const discount = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  return { ok: true as const, code: coupon.code, discount: Math.min(discount, subtotal) };
}
