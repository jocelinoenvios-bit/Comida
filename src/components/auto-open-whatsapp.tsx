"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

export function AutoOpenWhatsApp({ link }: { link: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = link;
    }, 500);
    return () => clearTimeout(t);
  }, [link]);

  return (
    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
      <p className="text-sm font-semibold text-emerald-800">Abrindo o WhatsApp do estabelecimento...</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
        <Button variant="whatsapp">
          <MessageCircle size={17} /> Abrir WhatsApp manualmente
        </Button>
      </a>
    </div>
  );
}
