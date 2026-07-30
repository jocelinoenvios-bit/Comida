import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Section({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-navy-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700">
            Ver tudo <ChevronRight size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function HScroll({ children }: { children: React.ReactNode }) {
  return <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">{children}</div>;
}
