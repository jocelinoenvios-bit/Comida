"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuário cancelou
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleShare}
      className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow", className)}
      aria-label="Compartilhar"
    >
      {copied ? <span className="text-[10px] font-bold text-brand-600">Copiado!</span> : <Share2 size={18} className="text-navy-600" />}
    </button>
  );
}
