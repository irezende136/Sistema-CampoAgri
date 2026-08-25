"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaForm } from "@/components/areas/area-form";
import { SafraForm } from "@/components/safras/safra-form";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listWhere, getById } from "@/lib/offline/repo";
import { criarAreaLocal, atualizarAreaLocal, removerAreaLocal, criarSafraLocal } from "@/lib/offline/cadastros";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { canDelete } from "@/lib/auth/permissions";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR, formatHectares } from "@/lib/utils/format";

type Area = {
  id: string;
  propriedade_id: string;
  nome: string;
  tipo: string;
  area_ha: number | null;
  status: string;
  observacoes: string | null;
};

type Safra = {
  id: string;
  nome: string;
  cultura: string;
  status: string;
  data_prevista_plantio: string | null;
};

const TIPO_AREA_LABELS: Record<string, string> = {
  lavoura: "Lavoura",
  pastagem: "Pastagem",
  piquete: "Piquete",
  canavial: "Canavial",
  area_silagem: "Área de silagem",
  area_experimental: "Área experimental",
  outro: "Outro",
};

function camposArea(dados: FormData) {
  return {
    propriedade_id: String(dados.get("propriedade_id") ?? ""),
    nome: String(dados.get("nome") ?? "").trim(),
    tipo: String(dados.get("tipo") ?? ""),
    area_ha: dados.get("area_ha") ? Number(dados.get("area_ha")) : null,
    status: String(dados.get("status") ?? "ativa"),
    observacoes: String(dados.get("observacoes") ?? "").trim() || null,
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

export function NovaAreaPage() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();
  const params = useSearchParams();
  const propriedadeId = params.get("propriedade_id") ?? "";

  async function salvar(dados: FormData) {
    const c = camposArea(dados);
    if (!c.nome) throw new Error("Informe o nome da área.");
    if (!c.tipo) throw new Error("Selecione o tipo de área.");
    if (!c.propriedade_id) throw new Error("Propriedade não informada.");

    const area = await criarAreaLocal(ctx, c);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/areas/${area.id}`);
  }

  if (!propriedadeId) {
    return (
      <div>
        <PageHeader title="Nova área" backHref="/propriedades" />
        <EmptyState
          title="Selecione a propriedade"
          description="Abra a propriedade e use o botão 'Nova área' para cadastrar o talhão."
          actionLabel="Ver propriedades"
          actionHref="/propriedades"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nova área / talhão" backHref={`/propriedades/${propriedadeId}`} />
      <Card>
        <CardContent>
          <AreaForm propriedadeId={propriedadeId} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EditarAreaPage({ areaId }: { areaId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(() => getById<Area>("areas", areaId), [areaId]);

  async function salvar(dados: FormData) {
    const c = camposArea(dados);
    if (!c.nome) throw new Error("Informe o nome da área.");

    await atualizarAreaLocal(ctx, areaId, c);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/areas/${areaId}`);
  }

  if (carregando) return <Carregando titulo="Editar área" voltar={`/areas/${areaId}`} />;
  if (!data) {
    return (
      <div>
        <PageHeader title="Editar área" backHref="/propriedades" />
        <EmptyState title="Área não encontrada" description="Ela pode ter sido excluída." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Editar área" backHref={`/areas/${areaId}`} />
      <Card>
        <CardContent>
          <AreaForm area={data as never} propriedadeId={data.propriedade_id} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function AreaDetalhe({ areaId }: { areaId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const area = await getById<Area>("areas", areaId);
    if (!area) return { area: null, propriedade: null, safras: [] };
    const [propriedade, safras] = await Promise.all([
      getById<{ id: string; nome: string }>("propriedades", area.propriedade_id),
      listWhere<Safra>("safras", { area_id: areaId }),
    ]);
    return {
      area,
      propriedade,
      safras: safras.sort((a, b) =>
        String(b.data_prevista_plantio ?? "").localeCompare(String(a.data_prevista_plantio ?? ""))
      ),
    };
  }, [areaId]);

  if (carregando) return <Carregando titulo="Área" voltar="/propriedades" />;

  if (!data?.area) {
    return (
      <div>
        <PageHeader title="Área" backHref="/propriedades" />
        <EmptyState
          title="Área não encontrada"
          description="Ela pode ter sido excluída, ou ainda não foi baixada para este aparelho."
        />
      </div>
    );
  }

  const a = data.area;

  return (
    <div>
      <PageHeader
        title={a.nome}
        description={data.propriedade?.nome ? `Propriedade: ${data.propriedade.nome}` : undefined}
        backHref={data.propriedade ? `/propriedades/${data.propriedade.id}` : "/propriedades"}
        actionLabel="Nova safra"
        actionHref={`/safras/novo?area_id=${areaId}`}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>{TIPO_AREA_LABELS[a.tipo] ?? a.tipo}</span>
            {a.area_ha !== null && <span>{formatHectares(a.area_ha)}</span>}
            <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href={`/areas/${areaId}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!window.confirm("Excluir esta área? Ela sai das listagens.")) return;
                  await removerAreaLocal(ctx, areaId);
                  await recarregarPendentes();
                  if (navigator.onLine) void sincronizar();
                  router.push(data.propriedade ? `/propriedades/${data.propriedade.id}` : "/propriedades");
                }}
              >
                Excluir área
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {a.observacoes && (
        <Card className="mb-5">
          <CardContent className="text-sm text-muted-foreground">{a.observacoes}</CardContent>
        </Card>
      )}

      <h2 className="font-semibold mb-3">Safras / Ciclos produtivos</h2>
      {data.safras.length === 0 ? (
        <EmptyState
          title="Nenhuma safra cadastrada"
          description="Registre a safra ou ciclo produtivo atual desta área (cultura, cultivar e datas de plantio)."
          actionLabel="Nova safra"
          actionHref={`/safras/novo?area_id=${areaId}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.safras.map((s) => (
            <Link key={s.id} href={`/safras/${s.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{s.nome}</div>
                      <div className="text-sm text-muted-foreground">{s.cultura}</div>
                    </div>
                    <Badge tone={statusTone(s.status)}>{statusLabel(s.status)}</Badge>
                  </div>
                  {s.data_prevista_plantio && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Plantio previsto: {formatDateBR(s.data_prevista_plantio)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function NovaSafraPage() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();
  const params = useSearchParams();
  const areaId = params.get("area_id") ?? "";

  const { data } = useLiveQuery(
    () => (areaId ? getById<Area>("areas", areaId) : Promise.resolve(null)),
    [areaId]
  );

  async function salvar(dados: FormData) {
    const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
    const numero = (k: string) => (dados.get(k) ? Number(dados.get(k)) : null);

    const nome = String(dados.get("nome") ?? "").trim();
    const cultura = String(dados.get("cultura") ?? "").trim();
    if (!nome) throw new Error("Informe o nome da safra/ciclo.");
    if (!cultura) throw new Error("Informe a cultura.");
    if (!areaId || !data) throw new Error("Área não informada.");

    const safra = await criarSafraLocal(ctx, {
      area_id: areaId,
      propriedade_id: data.propriedade_id,
      nome,
      cultura,
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
    });

    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/safras/${safra.id}`);
  }

  if (!areaId) {
    return (
      <div>
        <PageHeader title="Nova safra" backHref="/propriedades" />
        <EmptyState
          title="Selecione a área"
          description="Abra a área/talhão e use o botão 'Nova safra'."
          actionLabel="Ver propriedades"
          actionHref="/propriedades"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nova safra / ciclo" backHref={`/areas/${areaId}`} />
      <Card>
        <CardContent>
          <SafraForm areaId={areaId} propriedadeId={data?.propriedade_id} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}
