"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { SafraForm } from "@/components/safras/safra-form";
import { PlanejamentoForm } from "@/components/safras/planejamento-form";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listWhere, getById } from "@/lib/offline/repo";
import {
  atualizarSafraLocal,
  removerSafraLocal,
  salvarPlanejamentoLocal,
  criarInsumoLocal,
  removerInsumoLocal,
} from "@/lib/offline/cadastros";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { canDelete } from "@/lib/auth/permissions";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR, formatCurrencyBRL } from "@/lib/utils/format";
import { useFormSubmit } from "@/lib/offline/use-form-submit";

type Safra = {
  id: string;
  area_id: string;
  propriedade_id: string;
  nome: string;
  cultura: string;
  cultivar: string | null;
  status: string;
  data_prevista_plantio: string | null;
};

type Insumo = {
  id: string;
  tipo_insumo: string;
  nome_insumo: string;
  quantidade_ha: number | null;
  unidade: string | null;
  preco_unitario: number | null;
  custo_total: number | null;
};

const TIPO_INSUMO_OPTIONS = [
  ["semente", "Semente"],
  ["fertilizante", "Fertilizante"],
  ["herbicida", "Herbicida"],
  ["inseticida", "Inseticida"],
  ["fungicida", "Fungicida"],
  ["corretivo", "Corretivo"],
  ["diesel", "Diesel"],
  ["servico", "Serviço"],
  ["mao_de_obra", "Mão de obra"],
  ["outro", "Outro"],
];

const TIPO_INSUMO_LABELS = Object.fromEntries(TIPO_INSUMO_OPTIONS);

function camposSafra(dados: FormData) {
  const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
  const numero = (k: string) => (dados.get(k) ? Number(dados.get(k)) : null);
  return {
    nome: String(dados.get("nome") ?? "").trim(),
    cultura: String(dados.get("cultura") ?? "").trim(),
    finalidade: texto("finalidade"),
    cultivar: texto("cultivar"),
    data_prevista_plantio: texto("data_prevista_plantio"),
    data_real_plantio: texto("data_real_plantio"),
    data_prevista_colheita: texto("data_prevista_colheita"),
    data_real_colheita: texto("data_real_colheita"),
    populacao_planejada: numero("populacao_planejada"),
    espacamento: numero("espacamento"),
    profundidade_plantio: numero("profundidade_plantio"),
    sistema_plantio: texto("sistema_plantio"),
    status: String(dados.get("status") ?? "planejada"),
    observacoes: texto("observacoes"),
  };
}

function Carregando({ titulo, voltar }: { titulo: string; voltar: string }) {
  return (
    <div>
      <PageHeader title={titulo} backHref={voltar} />
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
        <Loader2 size={16} className="animate-spin" /> Carregando...
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EditarSafraPage({ safraId }: { safraId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(() => getById<Safra>("safras", safraId), [safraId]);

  async function salvar(dados: FormData) {
    const c = camposSafra(dados);
    if (!c.nome) throw new Error("Informe o nome da safra/ciclo.");
    if (!c.cultura) throw new Error("Informe a cultura.");

    await atualizarSafraLocal(ctx, safraId, c);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/safras/${safraId}`);
  }

  if (carregando) return <Carregando titulo="Editar safra" voltar={`/safras/${safraId}`} />;
  if (!data) {
    return (
      <div>
        <PageHeader title="Editar safra" backHref="/propriedades" />
        <EmptyState title="Safra não encontrada" description="Ela pode ter sido excluída." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Editar safra" backHref={`/safras/${safraId}`} />
      <Card>
        <CardContent>
          <SafraForm safra={data as never} areaId={data.area_id} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function SafraDetalhe({ safraId }: { safraId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const safra = await getById<Safra>("safras", safraId);
    if (!safra) return { safra: null, area: null, planejamento: null, insumos: [] };
    const [area, planejamentos, insumos] = await Promise.all([
      getById<{ id: string; nome: string; area_ha: number | null }>("areas", safra.area_id),
      listWhere<{ id: string }>("planejamento_plantio", { safra_id: safraId }),
      listWhere<Insumo>("insumos_custos", { safra_id: safraId }),
    ]);
    return { safra, area, planejamento: planejamentos[0] ?? null, insumos };
  }, [safraId]);

  async function apos(acao: Promise<unknown>) {
    await acao;
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
  }

  if (carregando) return <Carregando titulo="Safra" voltar="/propriedades" />;

  if (!data?.safra) {
    return (
      <div>
        <PageHeader title="Safra" backHref="/propriedades" />
        <EmptyState
          title="Safra não encontrada"
          description="Ela pode ter sido excluída, ou ainda não foi baixada para este aparelho."
        />
      </div>
    );
  }

  const s = data.safra;
  const custoTotal = data.insumos.reduce((soma, i) => soma + (i.custo_total ?? 0), 0);

  return (
    <div>
      <PageHeader
        title={s.nome}
        description={data.area?.nome ? `Área: ${data.area.nome}` : undefined}
        backHref={`/areas/${s.area_id}`}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>{s.cultura}</span>
            {s.cultivar && <span>{s.cultivar}</span>}
            {s.data_prevista_plantio && <span>Plantio: {formatDateBR(s.data_prevista_plantio)}</span>}
            <Badge tone={statusTone(s.status)}>{statusLabel(s.status)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href={`/safras/${safraId}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!window.confirm("Excluir esta safra? Ela sai das listagens.")) return;
                  await apos(removerSafraLocal(ctx, safraId));
                  router.push(`/areas/${s.area_id}`);
                }}
              >
                Excluir safra
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planejamento de plantio</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanejamentoOffline
            safraId={safraId}
            areaId={s.area_id}
            planejamentoId={data.planejamento?.id ?? null}
            aoSalvar={apos}
          />
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Insumos e custos</CardTitle>
          {data.insumos.length > 0 && (
            <span className="text-sm font-semibold">Total: {formatCurrencyBRL(custoTotal)}</span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {data.insumos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum insumo ou custo registrado para esta safra.
            </p>
          ) : (
            <div className="space-y-2">
              {data.insumos.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {i.nome_insumo}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({TIPO_INSUMO_LABELS[i.tipo_insumo] ?? i.tipo_insumo})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {i.quantidade_ha ? `${i.quantidade_ha} ${i.unidade ?? ""}/ha` : null}
                      {i.preco_unitario ? ` · ${formatCurrencyBRL(i.preco_unitario)}/${i.unidade ?? "un"}` : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrencyBRL(i.custo_total)}</span>
                    {canDelete(ctx.role) && (
                      <button
                        type="button"
                        onClick={() => void apos(removerInsumoLocal(ctx, i.id))}
                        className="text-muted-foreground hover:text-danger p-1"
                        aria-label="Excluir insumo"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <InsumoOfflineForm
            safraId={safraId}
            areaId={s.area_id}
            propriedadeId={s.propriedade_id}
            areaHa={data.area?.area_ha ?? null}
            aoSalvar={apos}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PlanejamentoOffline({
  safraId,
  areaId,
  planejamentoId,
  aoSalvar,
}: {
  safraId: string;
  areaId: string;
  planejamentoId: string | null;
  aoSalvar: (p: Promise<unknown>) => Promise<void>;
}) {
  const ctx = useOrgCtx();

  const { data } = useLiveQuery(
    () => (planejamentoId ? getById("planejamento_plantio", planejamentoId) : Promise.resolve(null)),
    [planejamentoId]
  );

  async function salvar(dados: FormData) {
    const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
    const numero = (k: string) => (dados.get(k) ? Number(dados.get(k)) : null);

    await aoSalvar(
      salvarPlanejamentoLocal(ctx, safraId, areaId, planejamentoId, {
        cultivar: texto("cultivar"),
        sementes_por_ha: numero("sementes_por_ha"),
        espacamento: numero("espacamento"),
        profundidade: numero("profundidade"),
        tratamento_sementes: texto("tratamento_sementes"),
        adubacao_base: texto("adubacao_base"),
        adubacao_cobertura: texto("adubacao_cobertura"),
        produtos_previstos: texto("produtos_previstos"),
        custo_estimado_ha: numero("custo_estimado_ha"),
        custo_total_estimado: numero("custo_total_estimado"),
        observacoes_tecnicas: texto("observacoes_tecnicas"),
      })
    );
  }

  return <PlanejamentoForm planejamento={data as never} aoSalvar={salvar} />;
}

// ---------------------------------------------------------------------------

function InsumoOfflineForm({
  safraId,
  areaId,
  propriedadeId,
  areaHa,
  aoSalvar,
}: {
  safraId: string;
  areaId: string;
  propriedadeId: string;
  areaHa: number | null;
  aoSalvar: (p: Promise<unknown>) => Promise<void>;
}) {
  const ctx = useOrgCtx();
  const [chave, setChave] = useState(0);

  const { onSubmit, salvando, erro } = useFormSubmit(async (dados) => {
    const tipo_insumo = String(dados.get("tipo_insumo") ?? "");
    const nome_insumo = String(dados.get("nome_insumo") ?? "").trim();
    if (!tipo_insumo) throw new Error("Selecione o tipo de insumo.");
    if (!nome_insumo) throw new Error("Informe o nome do insumo.");

    const numero = (k: string) => (dados.get(k) ? Number(dados.get(k)) : null);
    const quantidade_ha = numero("quantidade_ha");
    const preco_unitario = numero("preco_unitario");
    const custo_ha =
      quantidade_ha !== null && preco_unitario !== null ? quantidade_ha * preco_unitario : null;
    const custo_total = custo_ha !== null && areaHa !== null ? custo_ha * areaHa : null;

    await aoSalvar(
      criarInsumoLocal(ctx, {
        safra_id: safraId,
        area_id: areaId,
        propriedade_id: propriedadeId,
        tipo_insumo,
        nome_insumo,
        quantidade_ha,
        unidade: String(dados.get("unidade") ?? "").trim() || null,
        preco_unitario,
        custo_ha,
        area_total: areaHa,
        custo_total,
        observacoes: String(dados.get("observacoes") ?? "").trim() || null,
      })
    );
    setChave((k) => k + 1);
  });

  return (
    <form key={chave} onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Tipo de insumo" htmlFor="tipo_insumo">
          <Select id="tipo_insumo" name="tipo_insumo" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {TIPO_INSUMO_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Nome do insumo" htmlFor="nome_insumo">
          <Input id="nome_insumo" name="nome_insumo" required placeholder="Ex: Ureia 45%" />
        </FieldGroup>
        <FieldGroup label="Quantidade por hectare" htmlFor="quantidade_ha">
          <Input id="quantidade_ha" name="quantidade_ha" type="number" step="0.001" />
        </FieldGroup>
        <FieldGroup label="Unidade" htmlFor="unidade">
          <Input id="unidade" name="unidade" placeholder="kg, L, un" />
        </FieldGroup>
        <FieldGroup label="Preço unitário (R$)" htmlFor="preco_unitario">
          <Input id="preco_unitario" name="preco_unitario" type="number" step="0.01" />
        </FieldGroup>
      </div>
      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" className="min-h-11 h-11" />
      </FieldGroup>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Adicionando..." : "Adicionar insumo/custo"}
      </Button>
    </form>
  );
}
