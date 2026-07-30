import { requireMerchantEstablishment } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { CardapioClient } from "./cardapio-client";

export const metadata = { title: "Cardápio" };

export default async function PainelCardapioPage() {
  const { establishment } = await requireMerchantEstablishment();

  const [sections, additions, plan, productCount] = await Promise.all([
    prisma.menuSection.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { order: "asc" },
      include: { products: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.additionItem.findMany({ where: { establishmentId: establishment.id } }),
    establishment.planId ? prisma.plan.findUnique({ where: { id: establishment.planId } }) : null,
    prisma.product.count({ where: { establishmentId: establishment.id } }),
  ]);

  return (
    <CardapioClient
      establishmentId={establishment.id}
      sections={sections.map((s) => ({
        id: s.id,
        name: s.name,
        products: s.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          promoPrice: p.promoPrice,
          isAvailable: p.isAvailable,
          isCombo: p.isCombo,
        })),
      }))}
      additions={additions.map((a) => ({ id: a.id, name: a.name, price: a.price }))}
      productLimit={plan?.maxProducts ?? null}
      productCount={productCount}
    />
  );
}
