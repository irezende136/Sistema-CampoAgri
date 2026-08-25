"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecomendacaoForm } from "@/components/visitas/recomendacao-form";
import { useLiveQuery } from "@/lib/offline/hooks";
import { getById, listWhere } from "@/lib/offline/repo";
import { criarRecomendacaoLocal, atualizarRecomendacaoLocal } from "@/lib/offline/visita-actions";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import type { Database } from "@/types/database";

type Recomendacao = Database["public"]["Tables"]["recomendacoes"]["Row"];

function camposDoFormulario(dados: FormData) {
  const texto = (k: string) => String(dados.get(k) ?? "").trim() || null;
  return {
    area_id: String(dados.get("area_id") ?? "") || null,
    categoria: String(dados.get("categoria") ?? ""),
    recomendacao: String(dados.get("recomendacao") ?? "").trim(),
    prioridade: String(dados.get("prioridade") ?? "media"),
    prazo_sugerido: texto("prazo_sugerido"),
    produto_sugerido: texto("produto_sugerido"),
    dose: texto("dose"),
    volume_calda: texto("volume_calda"),
    area_aplicar: texto("area_aplicar"),
    observacoes: texto("observacoes"),
  };
}

export function RecomendacaoPage({
  visitaId,
  recomendacaoId,
}: {
  visitaId: string;
  recomendacaoId?: string;
}) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const visita = await getById<{ id: string; propriedade_id: string }>("visitas", visitaId);
    if (!visita) return { visita: null, areas: [], recomendacao: null };

    const [areas, recomendacao] = await Promise.all([
      listWhere<{ id: string; nome: string }>("areas", { propriedade_id: visita.propriedade_id }),
      recomendacaoId
        ? getById<Recomendacao & { id: string }>("recomendacoes", recomendacaoId)
        : Promise.resolve(null),
    ]);
    return { visita, areas: areas.sort((a, b) => a.nome.localeCompare(b.nome)), recomendacao };
  }, [visitaId, recomendacaoId]);

  async function salvar(dados: FormData) {
    const campos = camposDoFormulario(dados);
    if (!campos.categoria) throw new Error("Selecione a categoria.");
    if (!campos.recomendacao) throw new Error("Descreva a recomendação.");

    if (recomendacaoId) {
      await atualizarRecomendacaoLocal(ctx, recomendacaoId, campos);
    } else {
      await criarRecomendacaoLocal(ctx, visitaId, campos);
    }

    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/visitas/${visitaId}`);
  }

  const titulo = recomendacaoId ? "Editar recomendação" : "Nova recomendação";

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

  if (!data.visita || (recomendacaoId && !data.recomendacao)) {
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
          <RecomendacaoForm areas={data.areas} recomendacao={data.recomendacao} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}
