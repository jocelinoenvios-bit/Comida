"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface AddressInput {
  label: string;
  street: string;
  number: string;
  complement?: string;
  reference?: string;
  neighborhoodId: string;
  cityId: string;
  isDefault?: boolean;
}

export async function createAddress(input: AddressInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, requiresLogin: true as const };

  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...input, userId: session.user.id },
  });

  revalidatePath("/enderecos");
  revalidatePath("/checkout");
  return { ok: true as const, addressId: address.id };
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, requiresLogin: true as const };

  await prisma.address.deleteMany({ where: { id: addressId, userId: session.user.id } });
  revalidatePath("/enderecos");
  return { ok: true as const };
}

export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, requiresLogin: true as const };

  await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  await prisma.address.updateMany({ where: { id: addressId, userId: session.user.id }, data: { isDefault: true } });
  revalidatePath("/enderecos");
  return { ok: true as const };
}
