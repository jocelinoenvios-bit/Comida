"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { OpeningHours } from "@/lib/constants";

async function requireOwnedEstablishment(establishmentId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MERCHANT") {
    return { ok: false as const, message: "Não autorizado." };
  }
  const establishment = await prisma.establishment.findUnique({ where: { id: establishmentId } });
  if (!establishment || establishment.ownerId !== session.user.id) {
    return { ok: false as const, message: "Não autorizado." };
  }
  return { ok: true as const, establishment };
}

export async function updateEstablishmentProfile(
  establishmentId: string,
  data: {
    name: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    whatsapp: string;
    instagram?: string;
    pixKey?: string;
    deliveryFee: number;
    avgDeliveryTimeMin: number;
    serviceAreaNote?: string;
    categorySlugs: string[];
  },
) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  const categories = await prisma.category.findMany({ where: { slug: { in: data.categorySlugs } } });

  await prisma.$transaction([
    prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        pixKey: data.pixKey,
        deliveryFee: data.deliveryFee,
        avgDeliveryTimeMin: data.avgDeliveryTimeMin,
        serviceAreaNote: data.serviceAreaNote,
      },
    }),
    prisma.establishmentCategory.deleteMany({ where: { establishmentId } }),
    ...(categories.length
      ? [
          prisma.establishmentCategory.createMany({
            data: categories.map((c) => ({ establishmentId, categoryId: c.id })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/painel/loja");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function updateOpeningHours(establishmentId: string, hours: OpeningHours) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.establishment.update({
    where: { id: establishmentId },
    data: { openingHoursJson: JSON.stringify(hours) },
  });
  revalidatePath("/painel/horario");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function togglePause(establishmentId: string, isPaused: boolean, vacationUntil?: string | null) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.establishment.update({
    where: { id: establishmentId },
    data: { isPaused, vacationUntil: vacationUntil ? new Date(vacationUntil) : null },
  });
  revalidatePath("/painel/loja");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function createMenuSection(establishmentId: string, name: string) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  const count = await prisma.menuSection.count({ where: { establishmentId } });
  const section = await prisma.menuSection.create({ data: { establishmentId, name, order: count } });
  revalidatePath("/painel/cardapio");
  return { ok: true as const, sectionId: section.id };
}

interface ProductInput {
  menuSectionId: string;
  categorySlug?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  promoPrice?: number | null;
  isCombo?: boolean;
  additionIds?: string[];
}

export async function createProduct(establishmentId: string, input: ProductInput) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  const plan = check.establishment.planId
    ? await prisma.plan.findUnique({ where: { id: check.establishment.planId } })
    : null;
  if (plan?.maxProducts) {
    const count = await prisma.product.count({ where: { establishmentId } });
    if (count >= plan.maxProducts) {
      return { ok: false as const, message: `Seu plano permite até ${plan.maxProducts} produtos. Faça upgrade para adicionar mais.` };
    }
  }

  const category = input.categorySlug ? await prisma.category.findUnique({ where: { slug: input.categorySlug } }) : null;

  await prisma.product.create({
    data: {
      establishmentId,
      menuSectionId: input.menuSectionId,
      categoryId: category?.id,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      price: input.price,
      promoPrice: input.promoPrice || null,
      isCombo: input.isCombo ?? false,
      additions: input.additionIds?.length ? { connect: input.additionIds.map((id) => ({ id })) } : undefined,
    },
  });

  revalidatePath("/painel/cardapio");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function updateProduct(
  establishmentId: string,
  productId: string,
  input: Partial<ProductInput> & { isAvailable?: boolean },
) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  const category = input.categorySlug ? await prisma.category.findUnique({ where: { slug: input.categorySlug } }) : undefined;

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      price: input.price,
      promoPrice: input.promoPrice,
      isCombo: input.isCombo,
      isAvailable: input.isAvailable,
      categoryId: category?.id,
      additions: input.additionIds ? { set: input.additionIds.map((id) => ({ id })) } : undefined,
    },
  });

  revalidatePath("/painel/cardapio");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function deleteProduct(establishmentId: string, productId: string) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/painel/cardapio");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function toggleProductAvailability(establishmentId: string, productId: string, isAvailable: boolean) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.product.update({ where: { id: productId }, data: { isAvailable } });
  revalidatePath("/painel/cardapio");
  revalidatePath(`/loja/${check.establishment.slug}`);
  return { ok: true as const };
}

export async function createAddition(establishmentId: string, name: string, price: number) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.additionItem.create({ data: { establishmentId, name, price } });
  revalidatePath("/painel/cardapio");
  return { ok: true as const };
}

export async function deleteAddition(establishmentId: string, additionId: string) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.additionItem.delete({ where: { id: additionId } });
  revalidatePath("/painel/cardapio");
  return { ok: true as const };
}

export async function createCoupon(
  establishmentId: string,
  input: { code: string; type: "PERCENT" | "FIXED"; value: number; minOrderValue: number; maxUses?: number; expiresAt?: string },
) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  const existing = await prisma.coupon.findUnique({ where: { code: input.code.toUpperCase() } });
  if (existing) return { ok: false as const, message: "Já existe um cupom com esse código." };

  await prisma.coupon.create({
    data: {
      establishmentId,
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderValue: input.minOrderValue,
      maxUses: input.maxUses || null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });
  revalidatePath("/painel/cupons");
  return { ok: true as const };
}

export async function toggleCoupon(establishmentId: string, couponId: string, isActive: boolean) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.coupon.update({ where: { id: couponId }, data: { isActive } });
  revalidatePath("/painel/cupons");
  return { ok: true as const };
}

export async function deleteCoupon(establishmentId: string, couponId: string) {
  const check = await requireOwnedEstablishment(establishmentId);
  if (!check.ok) return check;

  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath("/painel/cupons");
  return { ok: true as const };
}
