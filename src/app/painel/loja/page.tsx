import { requireMerchantEstablishment } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "./company-form";

export const metadata = { title: "Minha loja" };

export default async function PainelLojaPage() {
  const { establishment } = await requireMerchantEstablishment();
  const categories = await prisma.establishmentCategory.findMany({
    where: { establishmentId: establishment.id },
    select: { category: { select: { slug: true } } },
  });

  return (
    <CompanyForm
      establishmentId={establishment.id}
      initial={{
        name: establishment.name,
        description: establishment.description ?? "",
        logoUrl: establishment.logoUrl ?? "",
        coverUrl: establishment.coverUrl ?? "",
        whatsapp: establishment.whatsapp,
        instagram: establishment.instagram ?? "",
        pixKey: establishment.pixKey ?? "",
        deliveryFee: establishment.deliveryFee,
        avgDeliveryTimeMin: establishment.avgDeliveryTimeMin,
        serviceAreaNote: establishment.serviceAreaNote ?? "",
        categorySlugs: categories.map((c) => c.category.slug),
        isPaused: establishment.isPaused,
      }}
    />
  );
}
