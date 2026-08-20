import Link from "next/link";
import { Wallet, CheckCircle2, XCircle } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canDelete } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { LancamentoActions } from "@/components/financeiro/lancamento-actions";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/domain/financeiro";
import { formatDateBR, formatCurrencyBRL, todayInSaoPauloISO } from "@/lib/utils/format";

const FILTROS = [
  ["", "Todos"],
  ["pendente", "Pendentes"],
  ["pago", "Pagos"],
  ["cancelado", "Cancelados"],
];

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("financeiro_visitas")
    .select("*, produtores(nome), propriedades(nome)")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("data_lancamento", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && ["pendente", "pago", "cancelado"].includes(status)) {
    query = query.eq("status_pagamento", status);
  }

  const inicioMes = `${todayInSaoPauloISO().slice(0, 7)}-01`;

  const [{ data: lancamentos }, { data: resumo }] = await Promise.all([
    query,
    supabase
      .from("financeiro_visitas")
      .select("valor_final, status_pagamento, data_pagamento")
      .eq("organization_id", ctx.organizationId)
      .is("deleted_at", null),
  ]);

  const aReceber = (resumo ?? [])
    .filter((l) => l.status_pagamento === "pendente")
    .reduce((sum, l) => sum + (l.valor_final ?? 0), 0);
  const recebidoMes = (resumo ?? [])
    .filter((l) => l.status_pagamento === "pago" && l.data_pagamento && l.data_pagamento >= inicioMes)
    .reduce((sum, l) => sum + (l.valor_final ?? 0), 0);
  const recebidoTotal = (resumo ?? [])
    .filter((l) => l.status_pagamento === "pago")
    .reduce((sum, l) => sum + (l.valor_final ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Cobranças dos serviços técnicos lançadas nas visitas"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="A receber" value={formatCurrencyBRL(aReceber)} icon={Wallet} tone="accent" />
        <StatCard label="Recebido no mês" value={formatCurrencyBRL(recebidoMes)} icon={CheckCircle2} />
        <StatCard label="Recebido (total)" value={formatCurrencyBRL(recebidoTotal)} icon={XCircle} tone="info" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTROS.map(([value, label]) => {
          const active = (status ?? "") === value;
          return (
            <Link
              key={value}
              href={value ? `/financeiro?status=${value}` : "/financeiro"}
              className={`rounded-full px-3.5 h-9 inline-flex items-center text-sm font-medium border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {!lancamentos || lancamentos.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento encontrado"
          description="As cobranças são lançadas na seção Financeiro da visita técnica. Abra uma visita para lançar a primeira."
          actionLabel="Ver visitas"
          actionHref="/visitas"
        />
      ) : (
        <div className="space-y-2">
          {lancamentos.map((l) => {
            const produtor = (l as unknown as { produtores?: { nome?: string } }).produtores;
            const propriedade = (l as unknown as { propriedades?: { nome?: string } }).propriedades;
            return (
              <Card key={l.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      {l.visita_id ? (
                        <Link href={`/visitas/${l.visita_id}`} className="hover:underline">
                          {l.descricao}
                        </Link>
                      ) : (
                        l.descricao
                      )}
                      <Badge tone={statusTone(l.status_pagamento)}>{statusLabel(l.status_pagamento)}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {[produtor?.nome, propriedade?.nome].filter(Boolean).join(" — ")}
                      {` · ${formatDateBR(l.data_lancamento)}`}
                      {l.forma_pagamento ? ` · ${FORMA_PAGAMENTO_LABELS[l.forma_pagamento] ?? l.forma_pagamento}` : ""}
                      {l.status_pagamento === "pago" && l.data_pagamento ? ` · pago em ${formatDateBR(l.data_pagamento)}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-semibold text-sm ${l.status_pagamento === "cancelado" ? "line-through text-muted-foreground" : ""}`}>
                      {formatCurrencyBRL(l.valor_final)}
                    </span>
                    <LancamentoActions id={l.id} status={l.status_pagamento} visitaId={l.visita_id} canDelete={canDelete(ctx.role)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
