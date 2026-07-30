import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireMerchantEstablishment() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/painel");
  if (session.user.role !== "MERCHANT") redirect("/");

  const establishment = await prisma.establishment.findUnique({ where: { ownerId: session.user.id } });
  if (!establishment) redirect("/");

  return { session, establishment };
}
