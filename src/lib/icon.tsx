import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

function toPascalCase(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[toPascalCase(name)] ?? Icons.Utensils;
  return <Icon {...props} />;
}
