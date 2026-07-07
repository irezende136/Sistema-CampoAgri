import { createClient } from "@/lib/supabase/server";

export type HistoryEvent = {
  id: string;
  type: "visita" | "relatorio";
  date: string;
  title: string;
  description?: string | null;
  href: string;
  status?: string | null;
};

export async function getPropertyHistory(organizationId: string, propriedadeId: string): Promise<HistoryEvent[]> {
  const supabase = await createClient();

  const [{ data: visitas }, { data: relatorios }] = await Promise.all([
    supabase
      .from("visitas")
      .select("id, data_visita, objetivo, status, resumo_geral")
      .eq("organization_id", organizationId)
      .eq("propriedade_id", propriedadeId)
      .is("deleted_at", null)
      .order("data_visita", { ascending: false }),
    supabase
      .from("relatorios")
      .select("id, data_geracao, codigo")
      .eq("organization_id", organizationId)
      .eq("propriedade_id", propriedadeId)
      .is("deleted_at", null)
      .order("data_geracao", { ascending: false }),
  ]);

  const events: HistoryEvent[] = [];

  for (const v of visitas ?? []) {
    events.push({
      id: v.id,
      type: "visita",
      date: v.data_visita,
      title: v.objetivo || "Visita técnica",
      description: v.resumo_geral,
      href: `/visitas/${v.id}`,
      status: v.status,
    });
  }

  for (const r of relatorios ?? []) {
    events.push({
      id: r.id,
      type: "relatorio",
      date: r.data_geracao,
      title: `Relatório gerado ${r.codigo ? "— " + r.codigo : ""}`,
      href: `/relatorios/${r.id}`,
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}
