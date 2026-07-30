import Link from "next/link";
import { DynamicIcon } from "@/lib/icon";
import { cn } from "@/lib/cn";

export function CategoryChip({
  slug,
  name,
  icon,
  active,
}: {
  slug: string;
  name: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className={cn(
        "flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-center transition-colors",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-gray-100 bg-white text-navy-700 hover:border-brand-200 hover:bg-brand-50/50",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          active ? "bg-brand-500 text-white" : "bg-navy-50 text-navy-600",
        )}
      >
        <DynamicIcon name={icon} size={18} />
      </span>
      <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{name}</span>
    </Link>
  );
}
