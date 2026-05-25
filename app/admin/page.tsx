import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getAdminDashboard, getCurrentProfile } from "@/lib/ruby-safira-repository";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const user = await getCurrentProfile();
  if (!user) redirect("/login");

  if (user.role !== "admin") {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-[var(--background)] px-[var(--gutter)] text-[var(--foreground)]">
        <div className="max-w-xl rounded-[8px] border border-[rgba(180,16,58,0.38)] bg-[var(--background-raised)] p-[var(--space-5)]">
          <ShieldAlert className="text-[#ff4d72]" />
          <h1 className="t-h3 mt-4">Acesso negado</h1>
          <p className="t-body mt-3">
            Esta area mostra estoque, custos, lucro e observacoes internas. Sua
            sessao atual nao tem permissao admin.
          </p>
          <Link href="/dashboard" className="btn-solid t-cta mt-6">
            Voltar ao dashboard
          </Link>
        </div>
      </main>
    );
  }

  const data = await getAdminDashboard();
  return <AdminPanel data={data} />;
}
