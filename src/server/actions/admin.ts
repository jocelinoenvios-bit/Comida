"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdminUser() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false as const, message: "Não autorizado." };
  }
  return { ok: true as const };
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCity(name: string, state: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  const slug = `${slugify(name)}-${state.toLowerCase()}`;
  const existing = await prisma.city.findUnique({ where: { slug } });
  if (existing) return { ok: false as const, message: "Cidade já cadastrada." };

  await prisma.city.create({ data: { name, state: state.toUpperCase(), slug } });
  revalidatePath("/admin/cidades");
  return { ok: true as const };
}

export async function toggleCityActive(cityId: string, isActive: boolean) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.city.update({ where: { id: cityId }, data: { isActive } });
  revalidatePath("/admin/cidades");
  return { ok: true as const };
}

export async function createNeighborhood(cityId: string, name: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.neighborhood.create({ data: { cityId, name } }).catch(() => {});
  revalidatePath("/admin/cidades");
  return { ok: true as const };
}

export async function deleteNeighborhood(neighborhoodId: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.neighborhood.delete({ where: { id: neighborhoodId } }).catch(() => {});
  revalidatePath("/admin/cidades");
  return { ok: true as const };
}

export async function setEstablishmentStatus(establishmentId: string, status: "APPROVED" | "SUSPENDED" | "PENDING") {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  const establishment = await prisma.establishment.update({ where: { id: establishmentId }, data: { status } });

  if (status === "APPROVED") {
    await prisma.notification.create({
      data: {
        userId: establishment.ownerId,
        title: "Loja aprovada!",
        body: `${establishment.name} agora está visível no Boraqui.`,
        type: "NOVO_ESTABELECIMENTO",
      },
    }).catch(() => {});
  }

  revalidatePath("/admin/estabelecimentos");
  revalidatePath(`/loja/${establishment.slug}`);
  return { ok: true as const };
}

export async function assignPlan(establishmentId: string, planId: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.establishment.update({ where: { id: establishmentId }, data: { planId } });
  revalidatePath("/admin/estabelecimentos");
  return { ok: true as const };
}

export async function updatePlan(planId: string, data: { priceMonthly: number; maxProducts: number | null; highlighted: boolean }) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.plan.update({ where: { id: planId }, data });
  revalidatePath("/admin/planos");
  return { ok: true as const };
}

export async function createCategory(name: string, icon: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  const slug = slugify(name);
  const count = await prisma.category.count();
  await prisma.category.create({ data: { slug, name, icon, order: count } }).catch(() => {});
  revalidatePath("/admin/categorias");
  return { ok: true as const };
}

export async function deleteCategory(categoryId: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
  revalidatePath("/admin/categorias");
  return { ok: true as const };
}

export async function createBanner(input: { cityId: string | null; title: string; imageUrl: string; linkUrl?: string }) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  const count = await prisma.banner.count();
  await prisma.banner.create({
    data: { cityId: input.cityId, title: input.title, imageUrl: input.imageUrl, linkUrl: input.linkUrl, order: count },
  });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true as const };
}

export async function toggleBanner(bannerId: string, isActive: boolean) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.banner.update({ where: { id: bannerId }, data: { isActive } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteBanner(bannerId: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.banner.delete({ where: { id: bannerId } }).catch(() => {});
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true as const };
}

export async function sendBroadcastNotification(title: string, body: string) {
  const check = await requireAdminUser();
  if (!check.ok) return check;

  await prisma.notification.create({ data: { userId: null, title, body, type: "PROMOCAO" } });
  revalidatePath("/admin/notificacoes");
  return { ok: true as const };
}
