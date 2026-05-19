import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  Gift,
  History,
  ShieldAlert,
  ShoppingBag,
  Ticket,
  Trophy,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { formatBRL } from "@/lib/profit-calculator";
import { getCustomerDashboard } from "@/lib/ruby-safira-repository";
import { getCurrentUser } from "@/lib/server-session";
import type { RaffleStatus } from "@/lib/ruby-safira-types";

const STATUS_LABEL: Record<RaffleStatus, string> = {
  ativa: "Ativa",
  encerrada: "Encerrada",
  ganha: "Ganha",
  perdida: "Perdida",
  aguardando_sorteio: "Aguardando sorteio",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "customer") {
    return (
      <AccessNotice
        title="Dashboard de cliente"
        description="Esta area mostra dados de cliente. Use o painel admin para estoque, financeiro e fichas tecnicas."
        href="/admin"
        action="Ir para admin"
      />
    );
  }

  const data = await getCustomerDashboard(user.id);
  if (!data) redirect("/login");

  return (
    <main className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <section className="content-wrap section-padding">
        <Header
          eyebrow="Area do cliente"
          title={`Salve, ${data.user.name}.`}
          description="Compras, bilhetes e premios em um painel simples. Dados locais seedados para validar visual."
        />

        <div className="mt-[var(--space-5)] grid gap-4 md:grid-cols-4">
          <MetricCard icon={<ShoppingBag />} label="Total gasto" value={formatBRL(data.summary.totalSpent)} />
          <MetricCard icon={<Activity />} label="Rifas ativas" value={String(data.summary.activeRaffles)} />
          <MetricCard icon={<Ticket />} label="Bilhetes ativos" value={String(data.summary.activeTickets)} />
          <MetricCard icon={<Trophy />} label="Premios ganhos" value={String(data.summary.prizesWon)} />
        </div>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-5)] lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Rifas participadas" icon={<Ticket size={18} />}>
            <div className="grid gap-3">
              {data.raffles.map((raffle) => (
                <article key={raffle.id} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="t-card-title">{raffle.title}</h2>
                      <p className="t-body-sm mt-1">{raffle.skinName}</p>
                    </div>
                    <StatusBadge status={raffle.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {raffle.tickets.map((ticket) => (
                      <span key={ticket} className="rounded-full border border-[rgba(91,168,255,0.28)] bg-[rgba(91,168,255,0.08)] px-3 py-1 t-card-sub">
                        #{ticket}
                      </span>
                    ))}
                  </div>
                  <p className="t-body-sm mt-4">
                    Sorteio: {formatDate(raffle.drawDate)} · Bilhete {formatBRL(raffle.ticketPrice)}
                  </p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Ultimas atividades" icon={<History size={18} />}>
            <div className="grid gap-3">
              {data.activities.map((activity) => (
                <div key={activity.id} className="rounded-[8px] border border-white/10 bg-black/25 p-4">
                  <p className="t-body-sm text-[var(--foreground)]">{activity.label}</p>
                  <p className="t-card-sub mt-2">{formatDate(activity.date)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-[var(--space-5)] grid gap-[var(--space-5)] lg:grid-cols-3">
          <Panel title="Compras" icon={<ShoppingBag size={18} />}>
            <ListTable
              rows={data.purchases.map((purchase) => [
                purchase.raffleTitle,
                `${purchase.tickets} bilhete(s)`,
                formatBRL(purchase.total),
                purchase.status,
              ])}
            />
          </Panel>
          <Panel title="Premios" icon={<Gift size={18} />}>
            {data.prizes.length ? (
              <div className="grid gap-3">
                {data.prizes.map((prize) => (
                  <div key={prize.id} className="rounded-[8px] border border-[rgba(180,16,58,0.32)] bg-[rgba(180,16,58,0.08)] p-4">
                    <p className="t-card-title">{prize.skinName}</p>
                    <p className="t-body-sm mt-1">{prize.title}</p>
                    <p className="t-card-sub mt-3">{formatDate(prize.date)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="Nenhum premio ainda." />
            )}
          </Panel>
          <Panel title="Vendas e indicacoes" icon={<History size={18} />}>
            <ListTable
              rows={data.salesHistory.map((entry) => [
                entry.type,
                entry.description,
                formatBRL(entry.value),
                formatDate(entry.date),
              ])}
            />
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Header({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="t-eyebrow">{eyebrow}</p>
        <h1 className="t-h2 mt-3 max-w-[12ch]">{title}</h1>
        <p className="t-body mt-4 max-w-[58ch]">{description}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="btn-ghost t-cta">Home</Link>
        <form action={logoutAction}>
          <button className="btn-solid t-cta" type="submit">Sair</button>
        </form>
      </div>
    </div>
  );
}

function AccessNotice({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-[var(--background)] px-[var(--gutter)] text-[var(--foreground)]">
      <div className="max-w-xl rounded-[8px] border border-[rgba(91,168,255,0.28)] bg-[var(--background-raised)] p-[var(--space-5)]">
        <ShieldAlert className="text-[var(--highlight)]" />
        <h1 className="t-h3 mt-4">{title}</h1>
        <p className="t-body mt-3">{description}</p>
        <Link href={href} className="btn-solid t-cta mt-6">{action}</Link>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
      <div className="text-[var(--highlight)] [&>svg]:size-5">{icon}</div>
      <p className="t-card-sub mt-4">{label}</p>
      <p className="t-h3 mt-1 text-[var(--foreground)]">{value}</p>
    </article>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-[var(--background-raised)] p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2 text-[var(--highlight)]">
        {icon}
        <h2 className="t-card-sub">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: RaffleStatus }) {
  return (
    <span className="rounded-full border border-[rgba(91,168,255,0.32)] bg-[rgba(91,168,255,0.08)] px-3 py-1 t-card-sub">
      {STATUS_LABEL[status]}
    </span>
  );
}

function ListTable({ rows }: { rows: string[][] }) {
  if (!rows.length) return <EmptyState label="Nada por aqui ainda." />;
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div key={row.join("-")} className="grid gap-1 rounded-[8px] border border-white/10 bg-black/20 p-3">
          {row.map((cell, index) => (
            <span
              key={`${cell}-${index}`}
              className={index === 0 ? "t-body-sm text-[var(--foreground)]" : "t-card-sub"}
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="t-body-sm rounded-[8px] border border-dashed border-white/10 p-4">{label}</p>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(`${value}T12:00:00`)
  );
}
