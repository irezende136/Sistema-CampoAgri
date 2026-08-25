"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EditVisitForm } from "@/components/visitas/edit-visit-form";
import { useLiveQuery } from "@/lib/offline/hooks";
import { getById } from "@/lib/offline/repo";
import { atualizarVisitaLocal } from "@/lib/offline/visita-actions";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import type { Database } from "@/types/database";

type Visita = Database["public"]["Tables"]["visitas"]["Row"];

export function EditarVisitaPage({ visitaId }: { visitaId: string }) {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data, carregando } = useLiveQuery(
    () => getById<Visita & { id: string; status: string }>("visitas", visitaId),
    [visitaId]
  );

  async function salvar(dados: FormData) {
    const dataVisita = String(dados.get("data_visita") ?? "").trim();
    if (!dataVisita) throw new Error("Informe a data da visita.");

    await atualizarVisitaLocal(ctx, visitaId, {
      data_visita: dataVisita,
      hora_inicial: String(dados.get("hora_inicial") ?? "").trim() || null,
      objetivo: String(dados.get("objetivo") ?? "").trim() || null,
      condicoes_climaticas: String(dados.get("condicoes_climaticas") ?? "").trim() || null,
    });

    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push(`/visitas/${visitaId}`);
  }

  if (carregando) {
    return (
      <div>
        <PageHeader title="Editar visita" backHref={`/visitas/${visitaId}`} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Editar visita" backHref={`/visitas/${visitaId}`} />
        <EmptyState title="Visita não encontrada" description="Ela pode ter sido excluída." />
      </div>
    );
  }

  // Visita finalizada não é mais editável — mesma regra do servidor.
  if (data.status !== "rascunho") {
    return (
      <div>
        <PageHeader title="Editar visita" backHref={`/visitas/${visitaId}`} />
        <EmptyState
          title="Visita já finalizada"
          description="Uma visita finalizada não pode mais ser editada."
          actionLabel="Voltar para a visita"
          actionHref={`/visitas/${visitaId}`}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Editar visita" backHref={`/visitas/${visitaId}`} />
      <Card>
        <CardContent>
          <EditVisitForm visita={data} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}
