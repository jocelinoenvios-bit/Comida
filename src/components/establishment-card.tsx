import Image from "next/image";
import Link from "next/link";
import { Clock, Truck } from "lucide-react";
import { StarRatingDisplay } from "./ui/star-rating";
import { Badge } from "./ui/badge";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface EstablishmentCardData {
  slug: string;
  name: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  deliveryFee: number;
  avgDeliveryTimeMin: number;
  categoryNames: string[];
  isOpen: boolean;
  highlighted?: boolean;
}

export function EstablishmentCard({ data, className }: { data: EstablishmentCardData; className?: string }) {
  return (
    <Link
      href={`/loja/${data.slug}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative h-32 w-full bg-navy-100">
        {data.coverUrl && (
          <Image
            src={data.coverUrl}
            alt={data.name}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {data.highlighted && (
          <Badge variant="brand" className="absolute left-2 top-2 bg-white/95 shadow">
            ⭐ Destaque
          </Badge>
        )}
        {!data.isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy-800">Fechado agora</span>
          </div>
        )}
      </div>
      <div className="flex gap-3 p-3">
        {data.logoUrl && (
          <div className="relative -mt-8 h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow">
            <Image src={data.logoUrl} alt="" fill sizes="56px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-navy-900">{data.name}</h3>
          <p className="truncate text-xs text-gray-500">{data.categoryNames.join(" • ")}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <StarRatingDisplay value={data.ratingAvg} count={data.ratingCount} />
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {data.avgDeliveryTimeMin} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck size={13} /> {data.deliveryFee === 0 ? "Grátis" : formatCurrency(data.deliveryFee)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
