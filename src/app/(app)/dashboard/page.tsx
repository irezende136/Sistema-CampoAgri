import Link from "next/link";
import { Users, MapPin, Leaf, ClipboardList, CalendarClock, ClipboardCheck, AlertTriangle, FileText } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { getDashboardData } from "@/lib/data/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateBR } from "@/lib/utils/format";

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
      </div>

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
  );
}
