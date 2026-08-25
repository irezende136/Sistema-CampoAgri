"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listAll, listWhere } from "@/lib/offline/repo";
import { criarVisitaLocal } from "@/lib/offline/visita-actions";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { todayInSaoPauloISO } from "@/lib/utils/format";

type Produtor = { id: string; nome: string };
type Propriedade = { id: string; nome: string; municipio: string | null; estado: string | null };

export function NovaVisita() {
  const params = useSearchParams();
  const produtorId = params.get("produtor_id");
  const propriedadeId = params.get("propriedade_id");

  if (!produtorId) return <EscolherProdutor />;
  if (!propriedadeId) return <EscolherPropriedade produtorId={produtorId} />;
  return <FormularioVisita produtorId={produtorId} propriedadeId={propriedadeId} />;
}

function Carregando() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
      <Loader2 size={16} className="animate-spin" /> Carregando...
    </div>
  );
}

function EscolherProdutor() {
  const { data } = useLiveQuery(() => listAll<Produtor>("produtores"), []);

  return (
    <div>
      <PageHeader title="Nova visita — selecione o produtor" backHref="/visitas" />
      {!data ? (
        <Carregando />
      ) : data.length === 0 ? (
        <EmptyState
          title="Nenhum produtor cadastrado"
          description="Cadastre um produtor antes de iniciar uma visita."
          actionLabel="Novo produtor"
          actionHref="/produtores/novo"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...data]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((p) => (
              <Link key={p.id} href={`/visitas/nova?produtor_id=${p.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="font-medium">{p.nome}</CardContent>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

function EscolherPropriedade({ produtorId }: { produtorId: string }) {
  const { data } = useLiveQuery(async () => {
    const [produtor, propriedades] = await Promise.all([
      listAll<Produtor>("produtores").then((ps) => ps.find((p) => p.id === produtorId) ?? null),
      listWhere<Propriedade>("propriedades", { produtor_id: produtorId }),
    ]);
    return { produtor, propriedades };
  }, [produtorId]);

  return (
    <div>
      <PageHeader
        title={`Nova visita — ${data?.produtor?.nome ?? ""}`}
        description="Selecione a propriedade"
        backHref="/visitas/nova"
      />
      {!data ? (
        <Carregando />
      ) : data.propriedades.length === 0 ? (
        <EmptyState
          title="Nenhuma propriedade cadastrada"
          description="Cadastre uma propriedade para este produtor antes de iniciar a visita."
          actionLabel="Nova propriedade"
          actionHref={`/propriedades/novo?produtor_id=${produtorId}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...data.propriedades]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((p) => (
              <Link key={p.id} href={`/visitas/nova?produtor_id=${produtorId}&propriedade_id=${p.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {[p.municipio, p.estado].filter(Boolean).join(" - ")}
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

function FormularioVisita({ produtorId, propriedadeId }: { produtorId: string; propriedadeId: string }) {
  const ctx = useOrgCtx();
  const { sincronizar, recarregarPendentes } = useSync();
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const { data } = useLiveQuery(async () => {
    const [produtores, propriedades] = await Promise.all([
      listAll<Produtor>("produtores"),
      listAll<Propriedade>("propriedades"),
    ]);
    return {
      produtor: produtores.find((p) => p.id === produtorId) ?? null,
      propriedade: propriedades.find((p) => p.id === propriedadeId) ?? null,
    };
  }, [produtorId, propriedadeId]);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dataVisita = String(form.get("data_visita") ?? "").trim();
    if (!dataVisita) {
      setErro("Informe a data da visita.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const visita = await criarVisitaLocal(ctx, {
        produtor_id: produtorId,
        propriedade_id: propriedadeId,
        data_visita: dataVisita,
        hora_inicial: String(form.get("hora_inicial") ?? "").trim() || null,
        objetivo: String(form.get("objetivo") ?? "").trim() || null,
        condicoes_climaticas: String(form.get("condicoes_climaticas") ?? "").trim() || null,
      });

      await recarregarPendentes();
      if (navigator.onLine) void sincronizar();
      router.push(`/visitas/${visita.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar a visita.");
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={`Nova visita — ${data?.produtor?.nome ?? ""}`}
        description={data?.propriedade?.nome}
        backHref={`/visitas/nova?produtor_id=${produtorId}`}
      />
      <Card>
        <CardContent>
          <form onSubmit={aoEnviar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Data da visita" htmlFor="data_visita">
                <Input
                  id="data_visita"
                  name="data_visita"
                  type="date"
                  required
                  defaultValue={todayInSaoPauloISO()}
                />
              </FieldGroup>
              <FieldGroup label="Horário inicial" htmlFor="hora_inicial">
                <Input id="hora_inicial" name="hora_inicial" type="time" />
              </FieldGroup>
            </div>
            <FieldGroup label="Objetivo da visita" htmlFor="objetivo">
              <Input
                id="objetivo"
                name="objetivo"
                placeholder="Ex: Avaliação de desenvolvimento inicial da lavoura"
              />
            </FieldGroup>
            <FieldGroup label="Condições climáticas" htmlFor="condicoes_climaticas">
              <Textarea
                id="condicoes_climaticas"
                name="condicoes_climaticas"
                placeholder="Ensolarado, 26°C, sem chuva nos últimos 5 dias..."
              />
            </FieldGroup>
            {erro && <p className="text-sm text-danger">{erro}</p>}
            <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
              {salvando ? "Iniciando..." : "Iniciar visita"}
            </Button>
            <p className="text-xs text-muted-foreground">
              A visita é salva no aparelho na hora. Se estiver sem sinal, ela sobe sozinha quando a
              conexão voltar.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
