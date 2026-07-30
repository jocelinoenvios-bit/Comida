import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, MessageCircle, Truck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEstablishmentBySlug } from "@/server/queries";
import { formatCurrency, formatPhoneForWhatsApp } from "@/lib/format";
import { isOpenNow, todayHoursLabel, weekSchedule } from "@/lib/hours";
import type { OpeningHours } from "@/lib/constants";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { EstablishmentMenu } from "@/components/establishment-menu";
import { FloatingCartBar } from "@/components/floating-cart-bar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const establishment = await prisma.establishment.findUnique({ where: { slug }, select: { name: true } });
  return { title: establishment?.name ?? "Estabelecimento" };
}

export default async function EstablishmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment || establishment.status !== "APPROVED") notFound();

  const session = await auth();
  const favorited = session?.user?.id
    ? !!(await prisma.favorite.findUnique({
        where: { userId_establishmentId: { userId: session.user.id, establishmentId: establishment.id } },
      }))
    : false;

  const hours = JSON.parse(establishment.openingHoursJson) as OpeningHours;
  const open = !establishment.isPaused && isOpenNow(hours);
  const whatsappGreetingUrl = `https://wa.me/${formatPhoneForWhatsApp(establishment.whatsapp)}?text=${encodeURIComponent(
    `Olá! Vim pelo Boraqui e gostaria de saber mais sobre o ${establishment.name}.`,
  )}`;

  const menuSections = establishment.menuSections
    .filter((s) => s.products.length > 0)
    .map((s) => ({
      id: s.id,
      name: s.name,
      products: s.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        price: p.price,
        promoPrice: p.promoPrice,
        additions: p.additions.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      })),
    }));

  const cartEstablishment = {
    id: establishment.id,
    slug: establishment.slug,
    name: establishment.name,
    whatsapp: establishment.whatsapp,
    deliveryFee: establishment.deliveryFee,
  };

  return (
    <div className="pb-24">
      <div className="relative h-48 w-full bg-navy-100 sm:h-64">
        {establishment.coverUrl && (
          <Image src={establishment.coverUrl} alt={establishment.name} fill sizes="100vw" priority className="object-cover" />
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <ShareButton title={establishment.name} />
          <FavoriteButton establishmentId={establishment.id} initialFavorited={favorited} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-10 flex items-end gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow">
            {establishment.logoUrl && (
              <Image src={establishment.logoUrl} alt="" fill sizes="80px" className="object-cover" />
            )}
          </div>
          <div className="pb-1">
            {establishment.plan?.highlighted && <Badge variant="brand">⭐ Destaque</Badge>}
          </div>
        </div>

        <h1 className="mt-3 text-2xl font-black text-navy-900">{establishment.name}</h1>
        <p className="text-sm text-gray-500">
          {establishment.categories.map((c) => c.category.name).join(" • ")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-navy-700">
          <StarRatingDisplay value={establishment.ratingAvg} count={establishment.ratingCount} size={16} />
          <span className="inline-flex items-center gap-1">
            <Clock size={15} className={open ? "text-emerald-600" : "text-red-500"} />
            {open ? "Aberto agora" : "Fechado"} · {todayHoursLabel(hours)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Truck size={15} />
            {establishment.deliveryFee === 0 ? "Grátis" : formatCurrency(establishment.deliveryFee)} ·{" "}
            {establishment.avgDeliveryTimeMin} min
          </span>
        </div>

        {establishment.isPaused && (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
            Este estabelecimento está temporariamente fechado.
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <a
            href={whatsappGreetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white hover:bg-[#1fb855] sm:flex-none sm:px-6"
          >
            <MessageCircle size={17} /> Falar no WhatsApp
          </a>
        </div>

        <nav className="no-scrollbar mt-6 flex gap-5 overflow-x-auto border-b border-gray-100 text-sm font-semibold text-gray-400">
          <a href="#cardapio" className="border-b-2 border-brand-500 py-2 text-navy-900">
            Cardápio
          </a>
          <a href="#avaliacoes" className="py-2 hover:text-navy-700">
            Avaliações
          </a>
          <a href="#informacoes" className="py-2 hover:text-navy-700">
            Informações
          </a>
        </nav>

        <section id="cardapio" className="scroll-mt-20">
          {menuSections.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Cardápio em atualização.</p>
          ) : (
            <EstablishmentMenu sections={menuSections} establishment={cartEstablishment} />
          )}
        </section>

        <section id="avaliacoes" className="scroll-mt-20 border-t border-gray-100 py-6">
          <h2 className="mb-4 text-lg font-extrabold text-navy-900">Avaliações</h2>
          {establishment.reviews.length === 0 ? (
            <p className="text-sm text-gray-500">Ainda sem avaliações.</p>
          ) : (
            <div className="space-y-4">
              {establishment.reviews.map((r) => {
                const overall = (r.foodRating + r.serviceRating + r.deliveryRating) / 3;
                return (
                  <div key={r.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-navy-900">{r.customer.name}</p>
                      <StarRatingDisplay value={overall} />
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm text-gray-600">{r.comment}</p>}
                    <div className="mt-2 flex gap-3 text-xs text-gray-400">
                      <span>Comida {r.foodRating}★</span>
                      <span>Atendimento {r.serviceRating}★</span>
                      <span>Entrega {r.deliveryRating}★</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section id="informacoes" className="scroll-mt-20 border-t border-gray-100 py-6">
          <h2 className="mb-4 text-lg font-extrabold text-navy-900">Informações</h2>
          {establishment.description && <p className="mb-4 text-sm text-gray-600">{establishment.description}</p>}
          <div className="mb-4 flex items-start gap-2 text-sm text-navy-700">
            <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
            <span>
              {establishment.neighborhood?.name}, {establishment.city.name}/{establishment.city.state}
              {establishment.serviceAreaNote && ` — ${establishment.serviceAreaNote}`}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            {weekSchedule(hours).map((d, i) => (
              <div
                key={d.label}
                className={`flex justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <span className="text-gray-500">{d.label}</span>
                <span className="font-medium text-navy-800">{d.text}</span>
              </div>
            ))}
          </div>
          {establishment.instagram && (
            <p className="mt-4 text-sm text-navy-700">
              Instagram:{" "}
              <Link
                href={`https://instagram.com/${establishment.instagram.replace("@", "")}`}
                target="_blank"
                className="font-semibold text-brand-600"
              >
                {establishment.instagram}
              </Link>
            </p>
          )}
        </section>
      </div>

      <FloatingCartBar establishmentId={establishment.id} />
    </div>
  );
}
