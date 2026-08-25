"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Pencil, CloudUpload, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropriedadeForm } from "@/components/propriedades/propriedade-form";
import { NavigateButtons } from "@/components/propriedades/navigate-buttons";
import { EstadoLista } from "@/components/offline/estado-lista";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listAll, listWhere, getById } from "@/lib/offline/repo";
import { listOutbox } from "@/lib/offline/outbox";
import {
  criarPropriedadeLocal,
  atualizarPropriedadeLocal,
  removerPropriedadeLocal,
} from "@/lib/offline/cadastros";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { canDelete } from "@/lib/auth/permissions";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatHectares } from "@/lib/utils/format";

type Propriedade = {
  id: string;
  produtor_id: string;
  nome: string;
  municipio: string | null;
  estado: string | null;
  localizacao: string | null;
  latitude: number | null;
  longitude: number | null;
  area_total_ha: number | null;
  tipo_atividade: string | null;
  observacoes: string | null;
};

type Area = { id: string; nome: string; tipo: string; area_ha: number | null; status: string };

function campos(dados: FormData) {
  const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
  const numero = (k: string) => (dados.get(k) ? Number(dados.get(k)) : null);
  return {
    produtor_id: String(dados.get("produtor_id") ?? "").trim() || null,
    nome: String(dados.get("nome") ?? "").trim(),
    municipio: texto("municipio"),
    estado: texto("estado"),
    localizacao: texto("localizacao"),
    latitude: numero("latitude"),
    longitude: numero("longitude"),
    area_total_ha: numero("area_total_ha"),
    tipo_atividade: texto("tipo_atividade"),
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

export function PropriedadesList() {
  const { data, carregando } = useLiveQuery(async () => {
    const [propriedades, produtores, fila] = await Promise.all([
      listAll<Propriedade>("propriedades"),
      listAll<{ id: string; nome: string }>("produtores"),
      listOutbox(),
    ]);
    return {
      propriedades: propriedades.sort((a, b) => a.nome.localeCompare(b.nome)),
      produtores: new Map(produtores.map((p) => [p.id, p.nome])),
      pendentes: new Set(fila.filter((f) => f.table === "propriedades").map((f) => f.recordId)),
    };
  }, []);

  const lista = data?.propriedades ?? [];

  return (
    <div>
      <PageHeader title="Propriedades" actionLabel="Nova propriedade" actionHref="/propriedades/novo" />
      <EstadoLista
        carregando={carregando}
        vazio={lista.length === 0}
        tituloVazio="Nenhuma propriedade cadastrada"
        descricaoVazio="Cadastre a propriedade de um produtor para registrar áreas, safras e visitas."
        acaoLabel="Nova propriedade"
        acaoHref="/propriedades/novo"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lista.map((p) => (
            <Link key={p.id} href={`/propriedades/${p.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="font-semibold flex items-center gap-1.5">
                    {data?.pendentes.has(p.id) && (
                      <CloudUpload size={14} className="text-warning shrink-0" aria-label="Ainda não enviada" />
                    )}
                    {p.nome}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data?.produtores.get(p.produtor_id) ?? "—"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin size={14} /> {[p.municipio, p.estado].filter(Boolean).join(" - ") || "Sem localização"}
                  </div>
                  {p.area_total_ha !== null && (
                    <div className="text-xs text-muted-foreground mt-1">{formatHectares(p.area_total_ha)}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </EstadoLista>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function NovaPropriedadePage() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();
  const params = useSearchParams();
  const produtorPadrao = params.get("produtor_id") ?? undefined;

  const { data } = useLiveQuery(() => listAll<{ id: string; nome: string }>("produtores"), []);

  async function salvar(dados: FormData) {
    const c = campos(dados);
    if (!c.nome) throw new Error("Informe o nome da propriedade.");
    if (!c.produtor_id) throw new Error("Selecione o produtor.");

    const prop = await criarPropriedadeLocal(ctx, c);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/propriedades/${prop.id}`);
  }

  return (
    <div>
      <PageHeader title="Nova propriedade" backHref="/propriedades" />
      <Card>
        <CardContent>
          <PropriedadeForm
            produtores={(data ?? []).sort((a, b) => a.nome.localeCompare(b.nome))}
            defaultProdutorId={produtorPadrao}
            aoSalvar={salvar}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EditarPropriedadePage({ propriedadeId }: { propriedadeId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const [propriedade, produtores] = await Promise.all([
      getById<Propriedade>("propriedades", propriedadeId),
      listAll<{ id: string; nome: string }>("produtores"),
    ]);
    return { propriedade, produtores: produtores.sort((a, b) => a.nome.localeCompare(b.nome)) };
  }, [propriedadeId]);

  async function salvar(dados: FormData) {
    const c = campos(dados);
    if (!c.nome) throw new Error("Informe o nome da propriedade.");

    await atualizarPropriedadeLocal(ctx, propriedadeId, c);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/propriedades/${propriedadeId}`);
  }

  if (carregando) return <Carregando titulo="Editar propriedade" voltar={`/propriedades/${propriedadeId}`} />;
  if (!data?.propriedade) {
    return (
      <div>
        <PageHeader title="Editar propriedade" backHref="/propriedades" />
        <EmptyState title="Propriedade não encontrada" description="Ela pode ter sido excluída." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Editar propriedade" backHref={`/propriedades/${propriedadeId}`} />
      <Card>
        <CardContent>
          <PropriedadeForm
            propriedade={data.propriedade as never}
            produtores={data.produtores}
            aoSalvar={salvar}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

const TIPO_AREA_LABELS: Record<string, string> = {
  lavoura: "Lavoura",
  pastagem: "Pastagem",
  piquete: "Piquete",
  canavial: "Canavial",
  area_silagem: "Área de silagem",
  area_experimental: "Área experimental",
  outro: "Outro",
};

export function PropriedadeDetalhe({ propriedadeId }: { propriedadeId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const propriedade = await getById<Propriedade>("propriedades", propriedadeId);
    if (!propriedade) return { propriedade: null, produtor: null, areas: [] };
    const [produtor, areas] = await Promise.all([
      getById<{ id: string; nome: string }>("produtores", propriedade.produtor_id),
      listWhere<Area>("areas", { propriedade_id: propriedadeId }),
    ]);
    return { propriedade, produtor, areas: areas.sort((a, b) => a.nome.localeCompare(b.nome)) };
  }, [propriedadeId]);

  if (carregando) return <Carregando titulo="Propriedade" voltar="/propriedades" />;

  if (!data?.propriedade) {
    return (
      <div>
        <PageHeader title="Propriedade" backHref="/propriedades" />
        <EmptyState
          title="Propriedade não encontrada"
          description="Ela pode ter sido excluída, ou ainda não foi baixada para este aparelho."
        />
      </div>
    );
  }

  const p = data.propriedade;

  return (
    <div>
      <PageHeader
        title={p.nome}
        description={data.produtor?.nome ? `Produtor: ${data.produtor.nome}` : undefined}
        backHref="/propriedades"
        actionLabel="Nova área"
        actionHref={`/areas/novo?propriedade_id=${propriedadeId}`}
      />

      <Card className="mb-5">
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {(p.municipio || p.estado) && <span>{[p.municipio, p.estado].filter(Boolean).join(" - ")}</span>}
            {p.area_total_ha !== null && <span>{formatHectares(p.area_total_ha)}</span>}
            {p.tipo_atividade && <span>{p.tipo_atividade}</span>}
          </div>
          {p.localizacao && <p className="text-sm text-muted-foreground">{p.localizacao}</p>}
          {p.observacoes && <p className="text-sm text-muted-foreground">{p.observacoes}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <NavigateButtons latitude={p.latitude} longitude={p.longitude} />
            <LinkButton href={`/propriedades/${propriedadeId}/historico`} variant="secondary" size="sm">
              Histórico
            </LinkButton>
            <LinkButton href={`/propriedades/${propriedadeId}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!window.confirm("Excluir esta propriedade? Ela sai das listagens.")) return;
                  await removerPropriedadeLocal(ctx, propriedadeId);
                  await recarregarPendentes();
                  if (navigator.onLine) void sincronizar();
                  router.push("/propriedades");
                }}
              >
                Excluir propriedade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Áreas / talhões</h2>
      {data.areas.length === 0 ? (
        <EmptyState
          title="Nenhuma área cadastrada"
          description="Cadastre os talhões desta propriedade para registrar safras e avaliações."
          actionLabel="Nova área"
          actionHref={`/areas/novo?propriedade_id=${propriedadeId}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.areas.map((a) => (
            <Link key={a.id} href={`/areas/${a.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{a.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {TIPO_AREA_LABELS[a.tipo] ?? a.tipo}
                        {a.area_ha !== null ? ` · ${formatHectares(a.area_ha)}` : ""}
                      </div>
                    </div>
                    <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
