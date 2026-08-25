"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { OcorrenciaForm } from "@/components/visitas/ocorrencia-form";
import { useLiveQuery } from "@/lib/offline/hooks";
import { getById, listWhere } from "@/lib/offline/repo";
import { criarOcorrenciaLocal, atualizarOcorrenciaLocal } from "@/lib/offline/visita-actions";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import type { Database } from "@/types/database";

type Ocorrencia = Database["public"]["Tables"]["ocorrencias"]["Row"];

function camposDoFormulario(dados: FormData) {
  const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
  return {
    area_id: String(dados.get("area_id") ?? ""),
    tipo: String(dados.get("tipo") ?? "").trim(),
    severidade: String(dados.get("severidade") ?? "baixa"),
    descricao: texto("descricao"),
    recomendacao_tecnica: texto("recomendacao_tecnica"),
    prazo_recomendado: texto("prazo_recomendado"),
    produto_recomendado: texto("produto_recomendado"),
    dose: texto("dose"),
    responsavel_acao: texto("responsavel_acao"),
  };
}

export function OcorrenciaPage({
  visitaId,
  ocorrenciaId,
}: {
  visitaId: string;
  ocorrenciaId?: string;
}) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const visita = await getById<{ id: string; propriedade_id: string; status: string }>("visitas", visitaId);
    if (!visita) return { visita: null, areas: [], ocorrencia: null };

    const [areas, ocorrencia] = await Promise.all([
      listWhere<{ id: string; nome: string }>("areas", { propriedade_id: visita.propriedade_id }),
      ocorrenciaId ? getById<Ocorrencia & { id: string }>("ocorrencias", ocorrenciaId) : Promise.resolve(null),
    ]);
    return { visita, areas: areas.sort((a, b) => a.nome.localeCompare(b.nome)), ocorrencia };
  }, [visitaId, ocorrenciaId]);

  async function salvar(dados: FormData) {
    const campos = camposDoFormulario(dados);
    if (!campos.area_id) throw new Error("Selecione a área.");
    if (!campos.tipo) throw new Error("Informe o tipo de ocorrência.");

    if (ocorrenciaId) {
      await atualizarOcorrenciaLocal(ctx, ocorrenciaId, campos);
    } else {
      await criarOcorrenciaLocal(ctx, visitaId, campos);
    }

    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/visitas/${visitaId}`);
  }

  const titulo = ocorrenciaId ? "Editar ocorrência" : "Nova ocorrência";

  if (carregando || !data) {
    return (
      <div>
        <PageHeader title={titulo} backHref={`/visitas/${visitaId}`} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      </div>
    );
  }

  if (!data.visita || (ocorrenciaId && !data.ocorrencia)) {
    return (
      <div>
        <PageHeader title={titulo} backHref={`/visitas/${visitaId}`} />
        <EmptyState
          title="Registro não encontrado"
          description="Ele pode ter sido excluído, ou ainda não foi baixado para este aparelho."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={titulo} backHref={`/visitas/${visitaId}`} />
      <Card>
        <CardContent>
          <OcorrenciaForm areas={data.areas} ocorrencia={data.ocorrencia} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}
