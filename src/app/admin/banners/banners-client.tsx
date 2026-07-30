"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { cn } from "@/lib/cn";
import { createBanner, toggleBanner, deleteBanner } from "@/server/actions/admin";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  cityName: string;
}

export function BannersClient({ banners, cities }: { banners: Banner[]; cities: { id: string; name: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cityId, setCityId] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-gray-200 p-4">
        <h3 className="mb-2 font-bold text-navy-900">Novo banner / campanha</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="h-fit rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="h-fit rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2">
          <ImageUploadField label="Imagem do banner" value={imageUrl} onChange={setImageUrl} aspectClassName="aspect-[16/5]" />
        </div>
        <Button
          size="sm"
          className="mt-3"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              if (!title.trim() || !imageUrl.trim()) return;
              await createBanner({ cityId: cityId || null, title: title.trim(), imageUrl: imageUrl.trim() });
              setTitle("");
              setImageUrl("");
              router.refresh();
            })
          }
        >
          Criar banner
        </Button>
      </div>

      <div className="space-y-2">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-navy-50">
              <Image src={b.imageUrl} alt={b.title} fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-900">{b.title}</p>
              <p className="text-xs text-gray-400">{b.cityName}</p>
            </div>
            <button
              onClick={() =>
                startTransition(async () => {
                  await toggleBanner(b.id, !b.isActive);
                  router.refresh();
                })
              }
              className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", b.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500")}
            >
              {b.isActive ? "Ativo" : "Inativo"}
            </button>
            <button
              onClick={() =>
                startTransition(async () => {
                  await deleteBanner(b.id);
                  router.refresh();
                })
              }
              className="text-gray-300 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-gray-400">Nenhum banner cadastrado.</p>}
      </div>
    </div>
  );
}
