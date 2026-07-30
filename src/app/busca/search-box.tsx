"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/busca?q=${encodeURIComponent(value)}`);
      }}
      className="relative"
    >
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar pizza, X-Bacon, açaí, pastel..."
        className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-brand-400"
      />
    </form>
  );
}
