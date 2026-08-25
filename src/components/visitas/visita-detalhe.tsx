"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileDown, Plus, Trash2, Pencil, Loader2, CloudUpload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NavigateButtons } from "@/components/propriedades/navigate-buttons";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR, formatCurrencyBRL } from "@/lib/utils/format";
import { FORMA_PAGAMENTO_LABELS } from "@/lib/domain/financeiro";
import { useLiveQuery } from "@/lib/offline/hooks";
import { carregarVisita, nomeDaArea } from "@/lib/offline/visita";
import { listOutbox } from "@/lib/offline/outbox";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { canDelete } from "@/lib/auth/permissions";
import {
  adicionarAvaliacaoLocal,
  removerAvaliacaoLocal,
  removerOcorrenciaLocal,
  removerRecomendacaoLocal,
  excluirVisitaLocal,
  finalizarVisitaLocal,
  atualizarVisitaLocal,
  atualizarStatusLancamentoLocal,
  removerLancamentoLocal,
} from "@/lib/offline/visita-actions";
import { VisitaFotos } from "@/components/visitas/visita-fotos";
import { LancamentoOfflineForm } from "@/components/financeiro/lancamento-offline-form";

const CATEGORIA_LABELS: Record<string, string> = {
  plantio: "Plantio",
  adubacao: "Adubação",
  pragas: "Pragas",
  doencas: "Doenças",
  plantas_daninhas: "Plantas daninhas",
  solo: "Solo",
  pastagem: "Pastagem",
  colheita: "Colheita",
  manejo_geral: "Manejo geral",
};

export function VisitaDetalhe({ visitaId }: { visitaId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [areaSelecionada, setAreaSelecionada] = useState("");

  const { data, carregando } = useLiveQuery(async () => {
    const dados = await carregarVisita(visitaId);
    const fila = await listOutbox();
    return { ...dados, pendentes: new Set(fila.map((f) => f.recordId)) };
  }, [visitaId]);

  async function apos(acao: Promise<unknown>) {
    await acao;
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
  }

  if (carregando || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
        <Loader2 size={16} className="animate-spin" /> Carregando visita...
      </div>
    );
  }

  const { visita, produtor, propriedade, areas, avaliacoes, ocorrencias, recomendacoes, lancamentos } = data;

  if (!visita) {
    return (
      <EmptyState
        title="Visita não encontrada"
        description="Ela pode ter sido excluída, ou ainda não foi baixada para este aparelho. Sincronize e tente de novo."
        actionLabel="Voltar para visitas"
        actionHref="/visitas"
      />
    );
  }

  const readOnly = visita.status !== "rascunho";
  const areasAvaliadas = new Set(avaliacoes.map((a) => a.area_id));
  const areasDisponiveis = areas.filter((a) => !areasAvaliadas.has(a.id));
  const totalCobrado = lancamentos
    .filter((l) => l.status_pagamento !== "cancelado")
    .reduce((s, l) => s + (l.valor_final ?? 0), 0);
  const totalPendente = lancamentos
    .filter((l) => l.status_pagamento === "pendente")
    .reduce((s, l) => s + (l.valor_final ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${produtor?.nome ?? "—"} — ${propriedade?.nome ?? "—"}`}
        description={`Visita de ${formatDateBR(visita.data_visita)}${visita.objetivo ? " · " + visita.objetivo : ""}`}
        backHref="/visitas"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={statusTone(visita.status)}>{statusLabel(visita.status)}</Badge>
        {data.pendentes.has(visita.id) && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
            <CloudUpload size={14} /> Ainda não enviada
          </span>
        )}
        {visita.condicoes_climaticas && (
          <span className="text-sm text-muted-foreground">{visita.condicoes_climaticas}</span>
        )}
        <NavigateButtons latitude={propriedade?.latitude ?? null} longitude={propriedade?.longitude ?? null} />
        <div className="flex-1" />
        {!readOnly && (
          <LinkButton href={`/visitas/${visitaId}/editar`} variant="secondary" size="sm">
            <Pencil size={16} /> Editar
          </LinkButton>
        )}
        {canDelete(ctx.role) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!window.confirm("Excluir esta visita? Ela sai das listagens.")) return;
              startTransition(async () => {
                await apos(excluirVisitaLocal(ctx, visitaId));
                router.push("/visitas");
              });
            }}
          >
            <Trash2 size={16} /> Excluir visita
          </Button>
        )}
        {visita.status === "rascunho" && (
          <Button
            type="button"
            onClick={() => {
              if (!window.confirm("Finalizar a visita? Depois disso ela não pode mais ser editada.")) return;
              void apos(finalizarVisitaLocal(ctx, visitaId));
            }}
          >
            Finalizar visita
          </Button>
        )}
        {readOnly && (
          <LinkButton href={`/visitas/${visitaId}/relatorio`} variant="accent">
            <FileDown size={18} /> Gerar relatório PDF
          </LinkButton>
        )}
      </div>

      {/* Áreas avaliadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Áreas avaliadas</CardTitle>
          {!readOnly && areasDisponiveis.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={areaSelecionada}
                onChange={(e) => setAreaSelecionada(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-2 text-sm"
              >
                <option value="">Adicionar área...</option>
                {areasDisponiveis.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                disabled={!areaSelecionada}
                onClick={() => {
                  startTransition(async () => {
                    const av = await adicionarAvaliacaoLocal(ctx, visitaId, areaSelecionada);
                    setAreaSelecionada("");
                    await apos(Promise.resolve());
                    router.push(`/visitas/${visitaId}/areas/${av.id}`);
                  });
                }}
              >
                <Plus size={16} /> Avaliar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {avaliacoes.length === 0 ? (
            <EmptyState
              title="Nenhuma área avaliada ainda"
              description="Selecione uma área da propriedade para começar a avaliação técnica."
            />
          ) : (
            <div className="space-y-2">
              {avaliacoes.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <Link href={`/visitas/${visitaId}/areas/${a.id}`} className="min-w-0 flex-1">
                    <div className="font-medium">{nomeDaArea(areas, a.area_id)}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.estadio_fenologico || "Sem estádio informado"}
                      {a.necessidade_intervencao ? " · Necessita intervenção" : ""}
                    </div>
                  </Link>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => void apos(removerAvaliacaoLocal(ctx, a.id))}
                      className="text-muted-foreground hover:text-danger p-1"
                      aria-label="Remover avaliação"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ocorrências */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ocorrências agronômicas</CardTitle>
          {!readOnly && (
            <LinkButton href={`/visitas/${visitaId}/ocorrencias/nova`} size="sm">
              <Plus size={16} /> Nova ocorrência
            </LinkButton>
          )}
        </CardHeader>
        <CardContent>
          {ocorrencias.length === 0 ? (
            <EmptyState title="Nenhuma ocorrência registrada" />
          ) : (
            <div className="space-y-2">
              {ocorrencias.map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      {o.tipo}
                      <Badge tone={statusTone(o.severidade)}>{statusLabel(o.severidade)}</Badge>
                      <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {nomeDaArea(areas, o.area_id)}
                      {o.descricao ? ` · ${o.descricao}` : ""}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/visitas/${visitaId}/ocorrencias/${o.id}/editar`}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void apos(removerOcorrenciaLocal(ctx, o.id))}
                        className="text-muted-foreground hover:text-danger p-1"
                        aria-label="Remover ocorrência"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recomendações técnicas</CardTitle>
          {!readOnly && (
            <LinkButton href={`/visitas/${visitaId}/recomendacoes/nova`} size="sm">
              <Plus size={16} /> Nova recomendação
            </LinkButton>
          )}
        </CardHeader>
        <CardContent>
          {recomendacoes.length === 0 ? (
            <EmptyState title="Nenhuma recomendação registrada" />
          ) : (
            <div className="space-y-2">
              {recomendacoes.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      {CATEGORIA_LABELS[r.categoria] ?? r.categoria}
                      <Badge tone={statusTone(r.prioridade)}>{statusLabel(r.prioridade)}</Badge>
                      <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.area_id ? `${nomeDaArea(areas, r.area_id)} · ` : ""}
                      {r.recomendacao}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/visitas/${visitaId}/recomendacoes/${r.id}/editar`}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void apos(removerRecomendacaoLocal(ctx, r.id))}
                        className="text-muted-foreground hover:text-danger p-1"
                        aria-label="Remover recomendação"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitaFotos
            visitaId={visitaId}
            propriedadeId={visita.propriedade_id}
            areas={areas}
            fotos={data.fotos}
            readOnly={readOnly}
            aoMudar={() => void apos(Promise.resolve())}
          />
        </CardContent>
      </Card>

      {/* Financeiro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Financeiro da visita</CardTitle>
          {lancamentos.length > 0 && (
            <div className="text-sm text-right">
              <span className="font-semibold">{formatCurrencyBRL(totalCobrado)}</span>
              {totalPendente > 0 && (
                <span className="block text-xs text-muted-foreground">
                  {formatCurrencyBRL(totalPendente)} a receber
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {lancamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma cobrança lançada para esta visita.
            </p>
          ) : (
            <div className="space-y-2">
              {lancamentos.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      {l.descricao}
                      <Badge tone={statusTone(l.status_pagamento)}>{statusLabel(l.status_pagamento)}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateBR(l.data_lancamento)}
                      {l.forma_pagamento ? ` · ${FORMA_PAGAMENTO_LABELS[l.forma_pagamento] ?? l.forma_pagamento}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-semibold ${l.status_pagamento === "cancelado" ? "line-through text-muted-foreground" : ""}`}>
                      {formatCurrencyBRL(l.valor_final)}
                    </span>
                    {l.status_pagamento === "pendente" ? (
                      <button
                        type="button"
                        onClick={() => void apos(atualizarStatusLancamentoLocal(ctx, l.id, "pago"))}
                        className="text-xs font-medium text-success hover:underline px-1.5 py-1"
                      >
                        Pago
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void apos(atualizarStatusLancamentoLocal(ctx, l.id, "pendente"))}
                        className="text-xs text-muted-foreground hover:underline px-1.5 py-1"
                      >
                        Reabrir
                      </button>
                    )}
                    {canDelete(ctx.role) && (
                      <button
                        type="button"
                        onClick={() => void apos(removerLancamentoLocal(ctx, l.id))}
                        className="text-muted-foreground hover:text-danger p-1"
                        aria-label="Excluir lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <LancamentoOfflineForm
            visitaId={visitaId}
            produtorId={visita.produtor_id}
            propriedadeId={visita.propriedade_id}
            aoSalvar={() => void apos(Promise.resolve())}
          />
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da visita</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumoOffline visita={visita} readOnly={readOnly} aoSalvar={apos} />
        </CardContent>
      </Card>
    </div>
  );
}

function ResumoOffline({
  visita,
  readOnly,
  aoSalvar,
}: {
  visita: { id: string; hora_final: string | null; resumo_geral: string | null; proximas_acoes: string | null; observacoes_finais: string | null };
  readOnly: boolean;
  aoSalvar: (p: Promise<unknown>) => Promise<void>;
}) {
  const ctx = useOrgCtx();
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSalvando(true);
        setSalvo(false);
        await aoSalvar(
          atualizarVisitaLocal(ctx, visita.id, {
            hora_final: String(f.get("hora_final") ?? "").trim() || null,
            resumo_geral: String(f.get("resumo_geral") ?? "").trim() || null,
            proximas_acoes: String(f.get("proximas_acoes") ?? "").trim() || null,
            observacoes_finais: String(f.get("observacoes_finais") ?? "").trim() || null,
          })
        );
        setSalvando(false);
        setSalvo(true);
      }}
    >
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="hora_final">
          Horário final
        </label>
        <input
          id="hora_final"
          name="hora_final"
          type="time"
          disabled={readOnly}
          defaultValue={visita.hora_final ?? ""}
          className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm disabled:opacity-50"
        />
      </div>
      {[
        ["resumo_geral", "Resumo geral da visita", visita.resumo_geral],
        ["proximas_acoes", "Próximas ações", visita.proximas_acoes],
        ["observacoes_finais", "Observações finais", visita.observacoes_finais],
      ].map(([name, label, valor]) => (
        <div key={String(name)}>
          <label className="block text-sm font-medium mb-1.5" htmlFor={String(name)}>
            {label}
          </label>
          <textarea
            id={String(name)}
            name={String(name)}
            disabled={readOnly}
            defaultValue={valor ?? ""}
            rows={3}
            className="w-full min-h-24 rounded-lg border border-border bg-card px-3 py-2 text-sm resize-y disabled:opacity-50"
          />
        </div>
      ))}
      {!readOnly && (
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar resumo"}
          </Button>
          {salvo && <span className="text-xs text-success">Salvo no aparelho</span>}
        </div>
      )}
    </form>
  );
}
