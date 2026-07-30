import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { Plus } from "lucide-react";

export function ProductRow({
  name,
  description,
  imageUrl,
  price,
  promoPrice,
  soldCount,
  onClick,
}: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  promoPrice?: number | null;
  soldCount?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-gray-100 py-4 text-left last:border-0"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy-900">{name}</p>
        {description && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{description}</p>}
        <div className="mt-1.5 flex items-baseline gap-2">
          {promoPrice ? (
            <>
              <span className="text-sm font-bold text-brand-600">{formatCurrency(promoPrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatCurrency(price)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-navy-800">{formatCurrency(price)}</span>
          )}
          {!!soldCount && soldCount > 50 && (
            <span className="text-[11px] font-medium text-gray-400">· {soldCount}+ vendidos</span>
          )}
        </div>
      </div>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-navy-50">
        {imageUrl && <Image src={imageUrl} alt={name} fill sizes="80px" className="object-cover" />}
        <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 shadow">
          <Plus size={16} />
        </span>
      </div>
    </button>
  );
}
