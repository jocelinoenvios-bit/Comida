import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export function ProductSearchCard({
  id,
  name,
  price,
  promoPrice,
  imageUrl,
  establishmentSlug,
  establishmentName,
}: {
  id: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  imageUrl?: string | null;
  establishmentSlug: string;
  establishmentName: string;
}) {
  return (
    <Link
      href={`/loja/${establishmentSlug}?produto=${id}`}
      className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-50">
        {imageUrl && <Image src={imageUrl} alt={name} fill sizes="64px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy-900">{name}</p>
        <p className="truncate text-xs text-gray-500">{establishmentName}</p>
        <div className="mt-1 flex items-baseline gap-2">
          {promoPrice ? (
            <>
              <span className="text-sm font-bold text-brand-600">{formatCurrency(promoPrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatCurrency(price)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-navy-800">{formatCurrency(price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
