import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./checkout-client";

export const metadata = { title: "Finalizar pedido" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar?callbackUrl=/checkout");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    include: { neighborhood: true },
    orderBy: { isDefault: "desc" },
  });

  return (
    <CheckoutClient
      addresses={addresses.map((a) => ({
        id: a.id,
        label: a.label,
        line: `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ""} · ${a.neighborhood.name}`,
      }))}
      customerName={session.user.name || ""}
      customerPhone={session.user.phone || ""}
    />
  );
}
