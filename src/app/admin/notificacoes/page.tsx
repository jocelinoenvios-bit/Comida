import { prisma } from "@/lib/prisma";
import { NotificacoesClient } from "./notificacoes-client";

export const metadata = { title: "Admin — Notificações" };

export default async function AdminNotificacoesPage() {
  const recent = await prisma.notification.findMany({
    where: { userId: null },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <NotificacoesClient />
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Últimas notificações enviadas</h3>
        <div className="divide-y divide-gray-100">
          {recent.map((n) => (
            <div key={n.id} className="py-2.5 text-sm">
              <p className="font-semibold text-navy-900">{n.title}</p>
              <p className="text-gray-500">{n.body}</p>
            </div>
          ))}
          {recent.length === 0 && <p className="text-sm text-gray-400">Nenhuma notificação enviada ainda.</p>}
        </div>
      </div>
    </div>
  );
}
