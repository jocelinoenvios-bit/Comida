"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setEstablishmentStatus, assignPlan } from "@/server/actions/admin";
import type { EstablishmentStatus } from "@/lib/constants";

interface Establishment {
  id: string;
  name: string;
  city: string;
  status: EstablishmentStatus;
  planId: string | null;
  planName: string;
}

const STATUS_VARIANT: Record<EstablishmentStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  SUSPENDED: "danger",
};
const STATUS_LABEL: Record<EstablishmentStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  SUSPENDED: "Suspenso",
};

export function EstabelecimentosClient({
  establishments,
  plans,
}: {
  establishments: Establishment[];
  plans: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | EstablishmentStatus>("ALL");

  const filtered = filter === "ALL" ? establishments : establishments.filter((e) => e.status === filter);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "SUSPENDED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === f ? "bg-navy-600 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            {f === "ALL" ? "Todos" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4">
            <div>
              <p className="font-bold text-navy-900">{e.name}</p>
              <p className="text-xs text-gray-500">{e.city}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Badge>
              <select
                defaultValue={e.planId ?? ""}
                onChange={(ev) =>
                  startTransition(async () => {
                    await assignPlan(e.id, ev.target.value);
                    router.refresh();
                  })
                }
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {e.status !== "APPROVED" && (
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await setEstablishmentStatus(e.id, "APPROVED");
                      router.refresh();
                    })
                  }
                >
                  Aprovar
                </Button>
              )}
              {e.status !== "SUSPENDED" && (
                <Button
                  size="sm"
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await setEstablishmentStatus(e.id, "SUSPENDED");
                      router.refresh();
                    })
                  }
                >
                  Suspender
                </Button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-gray-400">Nenhum estabelecimento neste filtro.</p>}
      </div>
    </div>
  );
}
