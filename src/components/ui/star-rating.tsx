"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";

export function StarRatingDisplay({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-navy-700">
      <Star size={size} className="fill-brand-500 text-brand-500" />
      {value.toFixed(1)}
      {typeof count === "number" && <span className="text-gray-400 font-normal">({count})</span>}
    </span>
  );
}

export function StarRatingInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label?: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      {label && <p className="mb-1 text-sm font-medium text-navy-700">{label}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} estrelas`}
          >
            <Star
              size={26}
              className={cn(
                "transition-colors",
                (hover || value) >= n ? "fill-brand-500 text-brand-500" : "text-gray-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
