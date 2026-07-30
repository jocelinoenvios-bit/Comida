import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatOrderCode } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS, type PaymentMethod, type OrderStatus } from "@/lib/constants";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp";
import { AutoOpenWhatsApp } from "@/components/auto-open-whatsapp";
import { ReviewForm } from "@/components/review-form";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<OrderStatus, "warning" | "brand" | "success" | "danger"> = {
  PENDING: "warning",
  SENT_TO_WHATSAPP: "brand",
  CONFIRMED: "success",
  CANCELLED: "danger",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enviar?: string }>;
}) {
  const { id } = await params;
  const { enviar } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect(`/entrar?callbackUrl=/pedidos/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      establishment: true,
      address: { include: { neighborhood: true } },
      coupon: true,
      review: true,
    },
  });

  if (!order || order.customerId !== session.user.id) notFound();

  const whatsappLink = buildWhatsAppLink(
    order.establishment.whatsapp,
    buildWhatsAppMessage({
      establishmentName: order.establishment.name,
      orderCode: formatOrderCode(order.id),
      customerName: session.user.name || "Cliente",
      customerPhone: session.user.phone || "",
      address: order.address ? `${order.address.street}, ${order.address.number} - ${order.address.neighborhood.name}` : undefined,
      paymentMethod: order.paymentMethod as PaymentMethod,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        observations: i.observations || undefined,
        additions: JSON.parse(i.additionsJson),
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      couponCode: order.coupon?.code,
      observations: order.observations || undefined,
    }),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      {enviar === "1" && <AutoOpenWhatsApp link={whatsappLink} />}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Pedido {formatOrderCode(order.id)}</h1>
          <p className="text-sm text-gray-500">{order.createdAt.toLocaleString("pt-BR")}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status as OrderStatus]}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
      </div>

      <Link href={`/loja/${order.establishment.slug}`} className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-navy-50">
          {order.establishment.logoUrl && (
            <Image src={order.establishment.logoUrl} alt="" fill sizes="48px" className="object-cover" />
          )}
        </div>
        <span className="font-bold text-navy-900">{order.establishment.name}</span>
      </Link>

      <div className="mb-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <div>
              <p className="font-semibold text-navy-900">
                {item.quantity}x {item.name}
              </p>
              {item.observations && <p className="text-xs italic text-gray-400">{item.observations}</p>}
            </div>
            <span className="font-bold text-navy-900">{formatCurrency(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 space-y-1.5 rounded-2xl border border-gray-100 bg-white p-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Taxa de entrega</span>
          <span>{formatCurrency(order.deliveryFee)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Desconto</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-navy-900">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <p className="pt-1 text-gray-500">Pagamento: {PAYMENT_LABELS[order.paymentMethod as PaymentMethod]}</p>
        {order.address && (
          <p className="text-gray-500">
            Entrega: {order.address.street}, {order.address.number} - {order.address.neighborhood.name}
          </p>
        )}
      </div>

      {enviar !== "1" && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mb-4 block">
          <span className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white hover:bg-[#1fb855]">
            Reenviar no WhatsApp
          </span>
        </a>
      )}

      {order.review ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
          Você avaliou este pedido. Obrigado pelo feedback! 🧡
        </div>
      ) : (
        <ReviewForm orderId={order.id} />
      )}
    </div>
  );
}
