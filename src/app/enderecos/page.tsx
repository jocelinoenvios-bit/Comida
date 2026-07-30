import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLaunchCity } from "@/server/queries";
import { AddressForm } from "./address-form";
import { AddressItem } from "./address-item";

export const metadata = { title: "Meus endereços" };

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect(`/entrar?callbackUrl=${encodeURIComponent(callbackUrl || "/enderecos")}`);

  const [addresses, city] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.user.id },
      include: { neighborhood: true },
      orderBy: { isDefault: "desc" },
    }),
    getLaunchCity(),
  ]);
  const neighborhoods = await prisma.neighborhood.findMany({ where: { cityId: city.id }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-4 text-xl font-extrabold text-navy-900">Meus endereços</h1>

      {addresses.length > 0 && (
        <div className="mb-6 space-y-3">
          {addresses.map((a) => (
            <AddressItem
              key={a.id}
              id={a.id}
              label={a.label}
              line={`${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ""} · ${a.neighborhood.name}`}
              isDefault={a.isDefault}
            />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Adicionar endereço</h2>
      <AddressForm cityId={city.id} neighborhoods={neighborhoods} callbackUrl={callbackUrl} />
    </div>
  );
}
