import { requireMerchantEstablishment } from "@/server/merchant";
import { PainelSidebar } from "./painel-sidebar";
import { Badge } from "@/components/ui/badge";
import type { EstablishmentStatus } from "@/lib/constants";

const STATUS_LABEL: Record<EstablishmentStatus, string> = {
  PENDING: "Aguardando aprovação",
  APPROVED: "Aprovado",
  SUSPENDED: "Suspenso",
};
const STATUS_VARIANT: Record<EstablishmentStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  SUSPENDED: "danger",
};

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { establishment } = await requireMerchantEstablishment();
  const status = establishment.status as EstablishmentStatus;

  return (
    <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
      <PainelSidebar />
      <div className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Painel do comerciante</p>
            <h1 className="text-xl font-extrabold text-navy-900">{establishment.name}</h1>
          </div>
          <Badge variant={STATUS_VARIANT[status] ?? "warning"}>{STATUS_LABEL[status] ?? status}</Badge>
        </div>
        {status !== "APPROVED" && (
          <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {status === "PENDING"
              ? "Sua loja está em análise pela equipe Boraqui e ainda não aparece para os clientes."
              : "Sua loja está suspensa e não aparece para os clientes. Entre em contato com o suporte."}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
