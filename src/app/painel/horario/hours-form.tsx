"use client";

import { useState, useTransition } from "react";
import { WEEKDAYS, type OpeningHours, type WeekdayKey } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { updateOpeningHours } from "@/server/actions/merchant";
import { cn } from "@/lib/cn";

export function HoursForm({ establishmentId, initial }: { establishmentId: string; initial: OpeningHours }) {
  const [hours, setHours] = useState<OpeningHours>(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function setDay(key: WeekdayKey, open: boolean, start = "08:00", end = "22:00") {
    setHours((h) => ({ ...h, [key]: open ? [[start, end]] : [] }));
  }

  function updateRange(key: WeekdayKey, index: 0 | 1, value: string) {
    setHours((h) => {
      const current = h[key]?.[0] ?? ["08:00", "22:00"];
      const updated: [string, string] = index === 0 ? [value, current[1]] : [current[0], value];
      return { ...h, [key]: [updated] };
    });
  }

  function handleSave() {
    startTransition(async () => {
      await updateOpeningHours(establishmentId, hours);
      setMessage("Horário atualizado!");
      setTimeout(() => setMessage(""), 3000);
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="space-y-2">
        {WEEKDAYS.map(({ key, label }) => {
          const range = hours[key]?.[0];
          const open = !!range;
          return (
            <div key={key} className="flex flex-wrap items-center gap-3 border-b border-gray-50 py-2 last:border-0">
              <button
                onClick={() => setDay(key, !open)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  open ? "bg-emerald-500" : "bg-gray-300",
                )}
              >
                <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-transform", open ? "left-6" : "left-1")} />
              </button>
              <span className="w-20 shrink-0 text-sm font-semibold text-navy-800">{label}</span>
              {open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={range?.[0] ?? "08:00"}
                    onChange={(e) => updateRange(key, 0, e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1"
                  />
                  às
                  <input
                    type="time"
                    value={range?.[1] ?? "22:00"}
                    onChange={(e) => updateRange(key, 1, e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Fechado</span>
              )}
            </div>
          );
        })}
      </div>
      {message && <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>}
      <Button className="mt-4" onClick={handleSave} disabled={pending}>
        {pending ? "Salvando..." : "Salvar horário"}
      </Button>
    </div>
  );
}
