"use client";

import { useTransition } from "react";
import { MapPin, Star, Trash2 } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/server/actions/addresses";
import { useRouter } from "next/navigation";

export function AddressItem({
  id,
  label,
  line,
  isDefault,
}: {
  id: string;
  label: string;
  line: string;
  isDefault: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4">
      <MapPin size={18} className="mt-0.5 shrink-0 text-brand-500" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-navy-900">{label}</p>
          {isDefault && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-600">Padrão</span>}
        </div>
        <p className="text-sm text-gray-500">{line}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        {!isDefault && (
          <button
            disabled={pending}
            onClick={() => startTransition(async () => { await setDefaultAddress(id); router.refresh(); })}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-brand-600"
            aria-label="Tornar padrão"
          >
            <Star size={16} />
          </button>
        )}
        <button
          disabled={pending}
          onClick={() => startTransition(async () => { await deleteAddress(id); router.refresh(); })}
          className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Remover"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
