"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Phone, MapPin, Pencil, CloudUpload, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton, Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/produtores/whatsapp-button";
import { ProdutorForm } from "@/components/produtores/produtor-form";
import { EstadoLista } from "@/components/offline/estado-lista";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listAll, listWhere, getById } from "@/lib/offline/repo";
import { listOutbox } from "@/lib/offline/outbox";
import { criarProdutorLocal, atualizarProdutorLocal, removerProdutorLocal } from "@/lib/offline/cadastros";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { canDelete } from "@/lib/auth/permissions";

type Produtor = {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
};

function camposDoFormulario(dados: FormData) {
  const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
  return {
    nome: String(dados.get("nome") ?? "").trim(),
    cpf_cnpj: texto("cpf_cnpj"),
    telefone: texto("telefone"),
    whatsapp: texto("whatsapp"),
    email: texto("email"),
    endereco: texto("endereco"),
    cidade: texto("cidade"),
    estado: texto("estado"),
    observacoes: texto("observacoes"),
  };
}

// ---------------------------------------------------------------------------

export function ProdutoresList() {
  const [busca, setBusca] = useState("");

  const { data, carregando } = useLiveQuery(async () => {
    const [produtores, fila] = await Promise.all([listAll<Produtor>("produtores"), listOutbox()]);
    return {
      produtores: produtores.sort((a, b) => a.nome.localeCompare(b.nome)),
      pendentes: new Set(fila.filter((f) => f.table === "produtores").map((f) => f.recordId)),
    };
  }, []);

  const filtrados = (data?.produtores ?? []).filter((p) =>
    p.nome.toLowerCase().includes(busca.trim().toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Produtores" actionLabel="Novo produtor" actionHref="/produtores/novo" />

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar produtor por nome..."
        className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm mb-4"
      />

      <EstadoLista
        carregando={carregando}
        vazio={filtrados.length === 0}
        tituloVazio={busca ? "Nenhum produtor encontrado" : "Nenhum produtor cadastrado"}
        descricaoVazio={
          busca
            ? "Tente outro termo de busca."
            : "Cadastre o primeiro produtor para começar a registrar propriedades e visitas."
        }
        acaoLabel={busca ? undefined : "Novo produtor"}
        acaoHref={busca ? undefined : "/produtores/novo"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((p) => (
            <Link key={p.id} href={`/produtores/${p.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="font-semibold flex items-center gap-1.5">
                    {data?.pendentes.has(p.id) && (
                      <CloudUpload size={14} className="text-warning shrink-0" aria-label="Ainda não enviado" />
                    )}
                    {p.nome}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {p.telefone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} /> {p.telefone}
                      </div>
                    )}
                    {(p.cidade || p.estado) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} /> {[p.cidade, p.estado].filter(Boolean).join(" - ")}
                      </div>
                    )}
                  </div>
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

export function NovoProdutorPage() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();
  // Quem chegou aqui tentando iniciar uma visita continua o fluxo em vez de
  // ser largado na tela do produtor.
  const noFluxoDeVisita = useSearchParams().get("fluxo") === "visita";

  async function salvar(dados: FormData) {
    const campos = camposDoFormulario(dados);
    if (!campos.nome) throw new Error("Informe o nome do produtor.");

    const produtor = await criarProdutorLocal(ctx, campos);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(
      noFluxoDeVisita
        ? `/propriedades/novo?produtor_id=${produtor.id}&fluxo=visita`
        : `/produtores/${produtor.id}`
    );
  }

  return (
    <div>
      <PageHeader
        title="Novo produtor"
        description={noFluxoDeVisita ? "Passo 1 de 2 para iniciar a visita" : undefined}
        backHref="/produtores"
      />
      <Card>
        <CardContent>
          <ProdutorForm aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EditarProdutorPage({ produtorId }: { produtorId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(
    () => getById<Produtor>("produtores", produtorId),
    [produtorId]
  );

  async function salvar(dados: FormData) {
    const campos = camposDoFormulario(dados);
    if (!campos.nome) throw new Error("Informe o nome do produtor.");

    await atualizarProdutorLocal(ctx, produtorId, campos);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/produtores/${produtorId}`);
  }

  if (carregando) return <Carregando titulo="Editar produtor" voltar={`/produtores/${produtorId}`} />;
  if (!data) {
    return (
      <div>
        <PageHeader title="Editar produtor" backHref="/produtores" />
        <EmptyState title="Produtor não encontrado" description="Ele pode ter sido excluído." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Editar produtor" backHref={`/produtores/${produtorId}`} />
      <Card>
        <CardContent>
          <ProdutorForm produtor={data as never} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

type Propriedade = {
  id: string;
  nome: string;
  municipio: string | null;
  estado: string | null;
  area_total_ha: number | null;
};

export function ProdutorDetalhe({ produtorId }: { produtorId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const produtor = await getById<Produtor>("produtores", produtorId);
    if (!produtor) return { produtor: null, propriedades: [] };
    const propriedades = await listWhere<Propriedade>("propriedades", { produtor_id: produtorId });
    return { produtor, propriedades: propriedades.sort((a, b) => a.nome.localeCompare(b.nome)) };
  }, [produtorId]);

  if (carregando) return <Carregando titulo="Produtor" voltar="/produtores" />;

  if (!data?.produtor) {
    return (
      <div>
        <PageHeader title="Produtor" backHref="/produtores" />
        <EmptyState
          title="Produtor não encontrado"
          description="Ele pode ter sido excluído, ou ainda não foi baixado para este aparelho."
        />
      </div>
    );
  }

  const p = data.produtor;

  return (
    <div>
      <PageHeader
        title={p.nome}
        backHref="/produtores"
        actionLabel="Nova propriedade"
        actionHref={`/propriedades/novo?produtor_id=${produtorId}`}
      />

      <Card className="mb-5">
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {p.cpf_cnpj && <span>{p.cpf_cnpj}</span>}
            {p.telefone && <span>{p.telefone}</span>}
            {p.email && <span>{p.email}</span>}
            {(p.cidade || p.estado) && <span>{[p.cidade, p.estado].filter(Boolean).join(" - ")}</span>}
          </div>
          {p.endereco && <p className="text-sm text-muted-foreground">{p.endereco}</p>}
          {p.observacoes && <p className="text-sm text-muted-foreground">{p.observacoes}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <WhatsAppButton phone={p.whatsapp || p.telefone} />
            <LinkButton href={`/produtores/${produtorId}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!window.confirm("Excluir este produtor? Ele sai das listagens.")) return;
                  await removerProdutorLocal(ctx, produtorId);
                  await recarregarPendentes();
                  if (navigator.onLine) void sincronizar();
                  router.push("/produtores");
                }}
              >
                Excluir produtor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Propriedades</h2>
      {data.propriedades.length === 0 ? (
        <EmptyState
          title="Nenhuma propriedade cadastrada"
          description="Cadastre a propriedade deste produtor para registrar áreas e visitas."
          actionLabel="Nova propriedade"
          actionHref={`/propriedades/novo?produtor_id=${produtorId}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.propriedades.map((prop) => (
            <Link key={prop.id} href={`/propriedades/${prop.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="font-semibold">{prop.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {[prop.municipio, prop.estado].filter(Boolean).join(" - ")}
                    {prop.area_total_ha ? ` · ${prop.area_total_ha} ha` : ""}
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
