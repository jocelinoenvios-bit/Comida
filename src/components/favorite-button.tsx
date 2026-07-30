"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { toggleFavorite } from "@/server/actions/favorites";

export function FavoriteButton({
  establishmentId,
  initialFavorited,
  className,
}: {
  establishmentId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleFavorite(establishmentId);
          if (res.requiresLogin) {
            router.push("/entrar");
            return;
          }
          setFavorited((f) => !f);
        })
      }
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow transition-colors",
        className,
      )}
      aria-label="Favoritar"
    >
      <Heart size={18} className={favorited ? "fill-brand-500 text-brand-500" : "text-navy-600"} />
    </button>
  );
}
