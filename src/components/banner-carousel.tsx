"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface BannerData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
}

export function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative mx-auto max-w-6xl px-4 pt-4">
      <div className="relative aspect-[16/6] w-full overflow-hidden rounded-2xl bg-navy-100 sm:aspect-[16/5]">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <Image src={b.imageUrl} alt={b.title} fill sizes="960px" className="object-cover" priority={i === 0} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-sm font-bold text-white sm:text-lg">{b.title}</p>
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-brand-500" : "w-1.5 bg-gray-300")}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
