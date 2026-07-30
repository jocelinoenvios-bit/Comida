import { requireAdmin } from "@/server/admin";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 p-4 md:p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Painel administrativo</p>
        <h1 className="mb-6 text-xl font-extrabold text-navy-900">Boraqui</h1>
        {children}
      </div>
    </div>
  );
}
