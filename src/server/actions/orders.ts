"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@/lib/constants";
import { revalidatePath } from "next/cache";

interface CreateOrderItemInput {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  observations?: string;
  additions: { name: string; price: number }[];
}

interface CreateOrderInput {
  establishmentId: string;
  addressId?: string | null;
  paymentMethod: PaymentMethod;
  observations?: string;
  items: CreateOrderItemInput[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string | null;
}

export async function createOrder(input: CreateOrderInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, requiresLogin: true as const };

  const establishment = await prisma.establishment.findUnique({ where: { id: input.establishmentId } });
  if (!establishment) return { ok: false as const, message: "Estabelecimento não encontrado." };

  const coupon = input.couponCode
    ? await prisma.coupon.findUnique({ where: { code: input.couponCode } })
    : null;

  const order = await prisma.order.create({
    data: {
      code: `BQ-${Date.now().toString(36).toUpperCase()}`,
      customerId: session.user.id,
      establishmentId: input.establishmentId,
      addressId: input.addressId || undefined,
      paymentMethod: input.paymentMethod,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      discount: input.discount,
      total: input.total,
      couponId: coupon?.id,
      observations: input.observations,
      status: "SENT_TO_WHATSAPP",
      items: {
        create: input.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          observations: i.observations,
          additionsJson: JSON.stringify(i.additions),
        })),
      },
    },
  });

  await prisma.establishment.update({
    where: { id: establishment.id },
    data: { ordersCount: { increment: 1 } },
  });

  if (coupon) {
    await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
  }

  for (const item of input.items) {
    await prisma.product
      .update({ where: { id: item.productId }, data: { soldCount: { increment: item.quantity } } })
      .catch(() => {});
  }

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Pedido enviado!",
      body: `Seu pedido ${order.code} foi enviado para ${establishment.name} via WhatsApp.`,
      type: "PEDIDO_ENVIADO",
    },
  });

  revalidatePath("/pedidos");
  return { ok: true as const, orderId: order.id, orderCode: order.code };
}
