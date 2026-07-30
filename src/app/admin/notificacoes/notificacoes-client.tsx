"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sendBroadcastNotification } from "@/server/actions/admin";

export function NotificacoesClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <h3 className="mb-3 font-bold text-navy-900">Enviar notificação para todos os clientes</h3>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Mensagem" rows={3} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        {sent && <p className="text-sm font-medium text-emerald-600">Notificação enviada!</p>}
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              if (!title.trim() || !body.trim()) return;
              await sendBroadcastNotification(title.trim(), body.trim());
              setTitle("");
              setBody("");
              setSent(true);
              setTimeout(() => setSent(false), 3000);
            })
          }
        >
          Enviar notificação
        </Button>
      </div>
    </div>
  );
}
