import Link from "next/link";
import {
  Users,
  MapPin,
  Leaf,
  ClipboardList,
  CalendarClock,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Wallet,
  CalendarX,
  CheckCircle2,
} from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { getDashboardData } from "@/lib/data/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { VisitasChart } from "@/components/dashboard/visitas-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateBR, formatCurrencyBRL } from "@/lib/utils/format";

export default async function DashboardPage() {
  const ctx = await requireOrgContext();
  const data = await getDashboardData(ctx.organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Olá, {ctx.email?.split("@")[0]}</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral de {ctx.organization?.nome}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Produtores" value={data.totalProdutores} icon={Users} />
        <StatCard label="Propriedades" value={data.totalPropriedades} icon={MapPin} />
        <StatCard label="Hectares acompanhados" value={data.hectaresAcompanhados.toLocaleString("pt-BR")} icon={Leaf} tone="accent" />
        <StatCard label="Áreas/talhões" value={data.totalAreas} icon={Leaf} />
        <StatCard label="Visitas no mês" value={data.visitasMes} icon={ClipboardList} />
        <StatCard label="Visitas agendadas" value={data.visitasPendentes} icon={CalendarClock} tone="info" />
        <StatCard label="Recomendações pendentes" value={data.recomendacoesPendentes} icon={ClipboardCheck} tone="accent" />
        <StatCard label="Ocorrências críticas" value={data.ocorrenciasCriticas} icon={AlertTriangle} tone="danger" />
        <StatCard label="Relatórios no mês" value={data.relatoriosMes} icon={FileText} />
        <StatCard label="A receber" value={formatCurrencyBRL(data.aReceber)} icon={Wallet} tone="accent" />
      </div>

      {(data.agendamentosAtrasados.length > 0 || data.recomendacoesVencidas.length > 0) && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" /> Central de alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.agendamentosAtrasados.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <CalendarX size={15} className="text-danger" /> Visitas agendadas em atraso
                </div>
                <ul className="space-y-1">
                  {data.agendamentosAtrasados.map((a) => (
                    <li key={a.id} className="text-sm text-muted-foreground flex items-center justify-between gap-2">
                      <span className="truncate">
                        {(a as { produtores?: { nome?: string } }).produtores?.nome} —{" "}
                        {(a as { propriedades?: { nome?: string } }).propriedades?.nome}
                      </span>
                      <span className="text-danger font-medium shrink-0">{formatDateBR(a.data_prevista)}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/agenda" className="text-xs text-primary font-medium">
                  Reagendar ou concluir na agenda →
                </Link>
              </div>
            )}
            {data.recomendacoesVencidas.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <ClipboardCheck size={15} className="text-warning" /> Recomendações com prazo vencido
                </div>
                <ul className="space-y-1">
                  {data.recomendacoesVencidas.map((r) => (
                    <li key={r.id} className="text-sm text-muted-foreground flex items-center justify-between gap-2">
                      <Link href={r.visita_id ? `/visitas/${r.visita_id}` : "/visitas"} className="truncate hover:underline">
                        {r.recomendacao}
                      </Link>
                      <span className="text-danger font-medium shrink-0">{formatDateBR(r.prazo_sugerido)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Visitas por mês</CardTitle>
            <Link href="/visitas" className="text-sm text-primary font-medium">
              Ver visitas
            </Link>
          </CardHeader>
          <CardContent>
            {data.visitasPorMes.every((m) => m.count === 0) ? (
              <div className="h-36 flex items-center justify-center text-sm text-muted-foreground gap-2">
                <CheckCircle2 size={16} /> Nenhuma visita registrada nos últimos 6 meses.
              </div>
            ) : (
              <VisitasChart meses={data.visitasPorMes} />
            )}
          </CardContent>
        </Card>

        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Próximas visitas agendadas</CardTitle>
          <Link href="/agenda" className="text-sm text-primary font-medium">
            Ver agenda
          </Link>
        </CardHeader>
        <CardContent>
          {data.proximasVisitas.length === 0 ? (
            <EmptyState
              title="Nenhuma visita agendada"
              description="Agende a próxima visita técnica para não perder o prazo com o produtor."
              actionLabel="Agendar visita"
              actionHref="/agenda/nova"
            />
          ) : (
            <ul className="divide-y divide-border -my-1">
              {data.proximasVisitas.map((v) => (
                <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {(v as { produtores?: { nome?: string } }).produtores?.nome} —{" "}
                      {(v as { propriedades?: { nome?: string } }).propriedades?.nome}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{v.objetivo}</div>
                  </div>
                  <div className="text-sm font-medium shrink-0">
                    {formatDateBR(v.data_prevista)}
                    {v.horario ? ` · ${v.horario.slice(0, 5)}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
