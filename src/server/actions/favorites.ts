"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(establishmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, requiresLogin: true as const };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_establishmentId: { userId: session.user.id, establishmentId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_establishmentId: { userId: session.user.id, establishmentId } },
    });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, establishmentId } });
  }

  revalidatePath("/favoritos");
  return { ok: true, favorited: !existing };
}
