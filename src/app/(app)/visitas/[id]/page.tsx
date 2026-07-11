import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, Plus, Trash2, Pencil } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canDelete } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/ui/delete-button";
import { NavigateButtons } from "@/components/propriedades/navigate-buttons";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";
import { ResumoForm } from "@/components/visitas/resumo-form";
import { FinalizarButton } from "@/components/visitas/finalizar-button";
import { PhotoUpload } from "@/components/visitas/photo-upload";
import { PhotoGallery } from "@/components/visitas/photo-gallery";
import {
  updateVisitaResumoAction,
  addAreaAvaliacaoAction,
  removeAvaliacaoAction,
  removeOcorrenciaAction,
  removeRecomendacaoAction,
  deleteVisitaAction,
} from "@/lib/actions/visitas";

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

export default async function VisitaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: visita } = await supabase
    .from("visitas")
    .select("*, produtores(id, nome), propriedades(id, nome, latitude, longitude)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!visita) notFound();
  const produtor = (visita as unknown as { produtores: { id: string; nome: string } }).produtores;
  const propriedade = (
    visita as unknown as {
      propriedades: { id: string; nome: string; latitude: number | null; longitude: number | null };
    }
  ).propriedades;
  const readOnly = visita.status !== "rascunho";

  const [{ data: avaliacoes }, { data: ocorrencias }, { data: recomendacoes }, { data: fotos }, { data: todasAreas }, { data: relatorio }] =
    await Promise.all([
      supabase
        .from("avaliacoes_area")
        .select("id, estadio_fenologico, vigor, necessidade_intervencao, areas(id, nome, tipo)")
        .eq("visita_id", id)
        .is("deleted_at", null),
      supabase
        .from("ocorrencias")
        .select("id, tipo, severidade, status, descricao, areas(nome)")
        .eq("visita_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("recomendacoes")
        .select("id, categoria, recomendacao, prioridade, status, areas(nome)")
        .eq("visita_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("fotos")
        .select("id, storage_path, legenda, areas(nome)")
        .eq("visita_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase.from("areas").select("id, nome").eq("propriedade_id", propriedade.id).is("deleted_at", null).order("nome"),
      supabase.from("relatorios").select("id").eq("visita_id", id).is("deleted_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

  const areasAvaliadasIds = new Set((avaliacoes ?? []).map((a) => (a as unknown as { areas: { id: string } }).areas.id));
  const areasDisponiveis = (todasAreas ?? []).filter((a) => !areasAvaliadasIds.has(a.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${produtor.nome} — ${propriedade.nome}`}
        description={`Visita de ${formatDateBR(visita.data_visita)}${visita.objetivo ? " · " + visita.objetivo : ""}`}
        backHref="/visitas"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={statusTone(visita.status)}>{statusLabel(visita.status)}</Badge>
        {visita.condicoes_climaticas && (
          <span className="text-sm text-muted-foreground">{visita.condicoes_climaticas}</span>
        )}
        <NavigateButtons latitude={propriedade.latitude} longitude={propriedade.longitude} />
        <div className="flex-1" />
        {!readOnly && (
          <LinkButton href={`/visitas/${id}/editar`} variant="secondary" size="sm">
            <Pencil size={16} /> Editar
          </LinkButton>
        )}
        {canDelete(ctx.role) && <DeleteButton action={deleteVisitaAction.bind(null, id)} label="Excluir visita" />}
        {visita.status === "rascunho" && <FinalizarButton visitaId={id} />}
        {visita.status !== "rascunho" && (
          <LinkButton href={relatorio ? `/relatorios/${relatorio.id}` : `/visitas/${id}/relatorio`} variant="accent">
            <FileDown size={18} /> {relatorio ? "Ver relatório" : "Gerar relatório PDF"}
          </LinkButton>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Áreas avaliadas</CardTitle>
          {!readOnly && areasDisponiveis.length > 0 && (
            <form action={addAreaAvaliacaoAction.bind(null, id)} className="flex items-center gap-2">
              <select name="area_id" required defaultValue="" className="h-9 rounded-lg border border-border bg-card px-2 text-sm">
                <option value="" disabled>
                  Adicionar área...
                </option>
                {areasDisponiveis.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm">
                <Plus size={16} /> Avaliar
              </Button>
            </form>
          )}
        </CardHeader>
        <CardContent>
          {!avaliacoes || avaliacoes.length === 0 ? (
            <EmptyState title="Nenhuma área avaliada ainda" description="Selecione uma área da propriedade para começar a avaliação técnica." />
          ) : (
            <div className="space-y-2">
              {avaliacoes.map((a) => {
                const area = (a as unknown as { areas: { id: string; nome: string; tipo: string } }).areas;
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <Link href={`/visitas/${id}/areas/${a.id}`} className="min-w-0 flex-1">
                      <div className="font-medium">{area.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.estadio_fenologico || "Sem estádio informado"} {a.necessidade_intervencao && "· Necessita intervenção"}
                      </div>
                    </Link>
                    {!readOnly && (
                      <form action={removeAvaliacaoAction.bind(null, a.id, id)}>
                        <button type="submit" className="text-muted-foreground hover:text-danger p-1">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ocorrências agronômicas</CardTitle>
          {!readOnly && (
            <LinkButton href={`/visitas/${id}/ocorrencias/nova`} size="sm">
              <Plus size={16} /> Nova ocorrência
            </LinkButton>
          )}
        </CardHeader>
        <CardContent>
          {!ocorrencias || ocorrencias.length === 0 ? (
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
                      {(o as unknown as { areas: { nome: string } }).areas?.nome}
                      {o.descricao ? ` · ${o.descricao}` : ""}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/visitas/${id}/ocorrencias/${o.id}/editar`}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Pencil size={16} />
                      </Link>
                      <form action={removeOcorrenciaAction.bind(null, o.id, id)}>
                        <button type="submit" className="text-muted-foreground hover:text-danger p-1">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recomendações técnicas</CardTitle>
          {!readOnly && (
            <LinkButton href={`/visitas/${id}/recomendacoes/nova`} size="sm">
              <Plus size={16} /> Nova recomendação
            </LinkButton>
          )}
        </CardHeader>
        <CardContent>
          {!recomendacoes || recomendacoes.length === 0 ? (
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
                      {(r as unknown as { areas?: { nome: string } }).areas?.nome ? `${(r as unknown as { areas?: { nome: string } }).areas?.nome} · ` : ""}
                      {r.recomendacao}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/visitas/${id}/recomendacoes/${r.id}/editar`}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Pencil size={16} />
                      </Link>
                      <form action={removeRecomendacaoAction.bind(null, r.id, id)}>
                        <button type="submit" className="text-muted-foreground hover:text-danger p-1">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!readOnly && (
            <PhotoUpload
              organizationId={ctx.organizationId}
              visitaId={id}
              propriedadeId={propriedade.id}
              areas={todasAreas ?? []}
            />
          )}
          <PhotoGallery visitaId={id} fotos={fotos ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da visita</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumoForm visita={visita} action={updateVisitaResumoAction.bind(null, id)} readOnly={readOnly} />
        </CardContent>
      </Card>
    </div>
  );
}
