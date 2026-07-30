import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatOrderCode } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

export const metadata = { title: "Meus pedidos" };

const STATUS_VARIANT: Record<OrderStatus, "warning" | "brand" | "success" | "danger"> = {
  PENDING: "warning",
  SENT_TO_WHATSAPP: "brand",
  CONFIRMED: "success",
  CANCELLED: "danger",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar?callbackUrl=/pedidos");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { establishment: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="mb-4 text-xl font-extrabold text-navy-900">Meus pedidos</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center text-gray-400">
          <ShoppingBag size={40} />
          <p className="mt-3 text-sm">Você ainda não fez nenhum pedido.</p>
          <Link href="/" className="mt-4 font-semibold text-brand-600">
            Explorar estabelecimentos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pedidos/${order.id}`}
              className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-navy-50">
                {order.establishment.logoUrl && (
                  <Image src={order.establishment.logoUrl} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-navy-900">{order.establishment.name}</p>
                  <Badge variant={STATUS_VARIANT[order.status as OrderStatus]}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {formatOrderCode(order.id)} · {order.items.length} ite{order.items.length === 1 ? "m" : "ns"} ·{" "}
                  {order.createdAt.toLocaleDateString("pt-BR")}
                </p>
                <p className="mt-1 font-bold text-navy-900">{formatCurrency(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
