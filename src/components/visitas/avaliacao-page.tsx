"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AvaliacaoForm } from "@/components/visitas/avaliacao-form";
import { useLiveQuery } from "@/lib/offline/hooks";
import { getById } from "@/lib/offline/repo";
import { atualizarAvaliacaoLocal } from "@/lib/offline/visita-actions";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import type { Database } from "@/types/database";

type Avaliacao = Database["public"]["Tables"]["avaliacoes_area"]["Row"];

const CAMPOS_TEXTO = [
  "estadio_fenologico",
  "desenvolvimento_geral",
  "stand_plantas",
  "uniformidade",
  "falhas_plantio",
  "acamamento",
  "vigor",
  "umidade_solo",
  "compactacao",
  "plantas_daninhas",
  "pragas",
  "doencas",
  "observacoes_gerais",
];

export function AvaliacaoPage({ visitaId, avaliacaoId }: { visitaId: string; avaliacaoId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(async () => {
    const avaliacao = await getById<Avaliacao & { id: string; area_id: string }>(
      "avaliacoes_area",
      avaliacaoId
    );
    if (!avaliacao) return { avaliacao: null, area: null };
    const area = await getById<{ id: string; nome: string }>("areas", avaliacao.area_id);
    return { avaliacao, area };
  }, [avaliacaoId]);

  async function salvar(dados: FormData) {
    const mudancas: Record<string, unknown> = {};
    for (const campo of CAMPOS_TEXTO) {
      mudancas[campo] = String(dados.get(campo) ?? "").trim() || null;
    }
    mudancas.necessidade_intervencao = dados.get("necessidade_intervencao") === "on";

    await atualizarAvaliacaoLocal(ctx, avaliacaoId, mudancas);
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/visitas/${visitaId}`);
  }

  if (carregando || !data) {
    return (
      <div>
        <PageHeader title="Avaliação da área" backHref={`/visitas/${visitaId}`} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      </div>
    );
  }

  if (!data.avaliacao) {
    return (
      <div>
        <PageHeader title="Avaliação da área" backHref={`/visitas/${visitaId}`} />
        <EmptyState
          title="Avaliação não encontrada"
          description="Ela pode ter sido removida, ou ainda não foi baixada para este aparelho."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Avaliação — ${data.area?.nome ?? "área"}`}
        description="Registre as observações técnicas desta área"
        backHref={`/visitas/${visitaId}`}
      />
      <Card>
        <CardContent>
          <AvaliacaoForm avaliacao={data.avaliacao} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}
