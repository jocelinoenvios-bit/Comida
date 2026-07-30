"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReview(input: {
  orderId: string;
  foodRating: number;
  serviceRating: number;
  deliveryRating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, requiresLogin: true as const };

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.customerId !== session.user.id) {
    return { ok: false as const, message: "Pedido não encontrado." };
  }

  const existing = await prisma.review.findUnique({ where: { orderId: order.id } });
  if (existing) return { ok: false as const, message: "Você já avaliou este pedido." };

  await prisma.review.create({
    data: {
      establishmentId: order.establishmentId,
      customerId: session.user.id,
      orderId: order.id,
      foodRating: input.foodRating,
      serviceRating: input.serviceRating,
      deliveryRating: input.deliveryRating,
      comment: input.comment,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { establishmentId: order.establishmentId },
    _avg: { foodRating: true, serviceRating: true, deliveryRating: true },
    _count: true,
  });
  const avg = ((agg._avg.foodRating ?? 0) + (agg._avg.serviceRating ?? 0) + (agg._avg.deliveryRating ?? 0)) / 3;
  await prisma.establishment.update({
    where: { id: order.establishmentId },
    data: { ratingAvg: avg, ratingCount: agg._count },
  });

  revalidatePath(`/pedidos/${order.id}`);
  return { ok: true as const };
}
