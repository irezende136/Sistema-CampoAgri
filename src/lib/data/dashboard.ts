import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(organizationId: string) {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString().slice(0, 10);

  const [
    produtores,
    propriedades,
    areas,
    visitasMes,
    visitasPendentesAgenda,
    recomendacoesPendentes,
    ocorrenciasCriticas,
    relatoriosMes,
    proximasVisitas,
    areasComHectares,
  ] = await Promise.all([
    supabase.from("produtores").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("propriedades").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("areas").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("visitas").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null).gte("data_visita", startOfMonthIso),
    supabase.from("agenda_visitas").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null).eq("status", "agendada"),
    supabase.from("recomendacoes").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null).eq("status", "pendente"),
    supabase.from("ocorrencias").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null).eq("severidade", "critica").neq("status", "resolvido"),
    supabase.from("relatorios").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null).gte("data_geracao", startOfMonth.toISOString()),
    supabase
      .from("agenda_visitas")
      .select("id, data_prevista, horario, objetivo, produtores(nome), propriedades(nome)")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .eq("status", "agendada")
      .order("data_prevista", { ascending: true })
      .limit(5),
    supabase.from("areas").select("area_ha").eq("organization_id", organizationId).is("deleted_at", null),
  ]);

  const hectaresAcompanhados = (areasComHectares.data ?? []).reduce(
    (sum, a) => sum + (Number(a.area_ha) || 0),
    0
  );

  return {
    totalProdutores: produtores.count ?? 0,
    totalPropriedades: propriedades.count ?? 0,
    totalAreas: areas.count ?? 0,
    hectaresAcompanhados,
    visitasMes: visitasMes.count ?? 0,
    visitasPendentes: visitasPendentesAgenda.count ?? 0,
    recomendacoesPendentes: recomendacoesPendentes.count ?? 0,
    ocorrenciasCriticas: ocorrenciasCriticas.count ?? 0,
    relatoriosMes: relatoriosMes.count ?? 0,
    proximasVisitas: proximasVisitas.data ?? [],
  };
}
