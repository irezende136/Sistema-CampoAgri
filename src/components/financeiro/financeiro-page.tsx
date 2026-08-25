"use client";

import Link from "next/link";
import { useState } from "react";
import { Wallet, CheckCircle2, TrendingUp, CloudUpload, RotateCcw, XCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { EstadoLista } from "@/components/offline/estado-lista";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listAll } from "@/lib/offline/repo";
import { listOutbox } from "@/lib/offline/outbox";
import {
  atualizarStatusLancamentoLocal,
  removerLancamentoLocal,
} from "@/lib/offline/visita-actions";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { canDelete } from "@/lib/auth/permissions";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/domain/financeiro";
import { formatDateBR, formatCurrencyBRL, todayInSaoPauloISO } from "@/lib/utils/format";

type Lancamento = {
  id: string;
  visita_id: string | null;
  produtor_id: string;
  propriedade_id: string | null;
  descricao: string;
  valor_final: number;
  status_pagamento: string;
  data_lancamento: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
};

const FILTROS = [
  ["", "Todos"],
  ["pendente", "Pendentes"],
  ["pago", "Pagos"],
  ["cancelado", "Cancelados"],
];

export function FinanceiroPage() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const [filtro, setFiltro] = useState("");

  const { data, carregando } = useLiveQuery(async () => {
    const [lancamentos, produtores, propriedades, fila] = await Promise.all([
      listAll<Lancamento>("financeiro_visitas"),
      listAll<{ id: string; nome: string }>("produtores"),
      listAll<{ id: string; nome: string }>("propriedades"),
      listOutbox(),
    ]);
    return {
      lancamentos: lancamentos.sort((a, b) => b.data_lancamento.localeCompare(a.data_lancamento)),
      produtores: new Map(produtores.map((p) => [p.id, p.nome])),
      propriedades: new Map(propriedades.map((p) => [p.id, p.nome])),
      pendentesFila: new Set(
        fila.filter((f) => f.table === "financeiro_visitas").map((f) => f.recordId)
      ),
    };
  }, []);

  async function apos(acao: Promise<unknown>) {
    await acao;
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
  }

  const todos = data?.lancamentos ?? [];
  const inicioMes = `${todayInSaoPauloISO().slice(0, 7)}-01`;

  const aReceber = todos
    .filter((l) => l.status_pagamento === "pendente")
    .reduce((s, l) => s + (l.valor_final ?? 0), 0);
  const recebidoMes = todos
    .filter((l) => l.status_pagamento === "pago" && l.data_pagamento && l.data_pagamento >= inicioMes)
    .reduce((s, l) => s + (l.valor_final ?? 0), 0);
  const recebidoTotal = todos
    .filter((l) => l.status_pagamento === "pago")
    .reduce((s, l) => s + (l.valor_final ?? 0), 0);

  const filtrados = filtro ? todos.filter((l) => l.status_pagamento === filtro) : todos;

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Cobranças dos serviços técnicos lançadas nas visitas"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="A receber" value={formatCurrencyBRL(aReceber)} icon={Wallet} tone="accent" />
        <StatCard label="Recebido no mês" value={formatCurrencyBRL(recebidoMes)} icon={CheckCircle2} />
        <StatCard label="Recebido (total)" value={formatCurrencyBRL(recebidoTotal)} icon={TrendingUp} tone="info" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTROS.map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltro(valor)}
            className={`rounded-full px-3.5 h-9 inline-flex items-center text-sm font-medium border transition-colors ${
              filtro === valor
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <EstadoLista
        carregando={carregando}
        vazio={filtrados.length === 0}
        tituloVazio="Nenhum lançamento encontrado"
        descricaoVazio="As cobranças são lançadas na seção Financeiro da visita técnica. Abra uma visita para lançar a primeira."
        acaoLabel="Ver visitas"
        acaoHref="/visitas"
      >
        <div className="space-y-2">
          {filtrados.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium flex items-center gap-2 flex-wrap">
                    {data?.pendentesFila.has(l.id) && (
                      <CloudUpload size={14} className="text-warning shrink-0" aria-label="Ainda não enviado" />
                    )}
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
                    {[data?.produtores.get(l.produtor_id), l.propriedade_id ? data?.propriedades.get(l.propriedade_id) : null]
                      .filter(Boolean)
                      .join(" — ")}
                    {` · ${formatDateBR(l.data_lancamento)}`}
                    {l.forma_pagamento ? ` · ${FORMA_PAGAMENTO_LABELS[l.forma_pagamento] ?? l.forma_pagamento}` : ""}
                    {l.status_pagamento === "pago" && l.data_pagamento
                      ? ` · pago em ${formatDateBR(l.data_pagamento)}`
                      : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-semibold text-sm ${
                      l.status_pagamento === "cancelado" ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {formatCurrencyBRL(l.valor_final)}
                  </span>
                  {l.status_pagamento === "pendente" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void apos(atualizarStatusLancamentoLocal(ctx, l.id, "pago"))}
                        className="inline-flex items-center gap-1 text-xs font-medium text-success hover:underline px-1.5 py-1"
                      >
                        <CheckCircle2 size={15} /> Pago
                      </button>
                      <button
                        type="button"
                        onClick={() => void apos(atualizarStatusLancamentoLocal(ctx, l.id, "cancelado"))}
                        className="text-muted-foreground hover:text-danger p-1"
                        aria-label="Cancelar cobrança"
                      >
                        <XCircle size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void apos(atualizarStatusLancamentoLocal(ctx, l.id, "pendente"))}
                      className="text-muted-foreground hover:text-foreground p-1"
                      aria-label="Voltar para pendente"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                  {canDelete(ctx.role) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("Excluir este lançamento?")) return;
                        void apos(removerLancamentoLocal(ctx, l.id));
                      }}
                      className="text-muted-foreground hover:text-danger p-1"
                      aria-label="Excluir lançamento"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </EstadoLista>
    </div>
  );
}
