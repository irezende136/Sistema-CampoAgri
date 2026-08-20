import { createClient } from "@/lib/supabase/server";
import { todayInSaoPauloISO } from "@/lib/utils/format";

export async function getDashboardData(organizationId: string) {
  const supabase = await createClient();

  const hoje = todayInSaoPauloISO();
  const startOfMonthIso = `${hoje.slice(0, 7)}-01`;
  const startOfMonth = new Date(`${startOfMonthIso}T00:00:00-03:00`);

  // Primeiro dia do mês, 5 meses atrás (janela de 6 meses para o gráfico)
  const chartStart = new Date(startOfMonth);
  chartStart.setMonth(chartStart.getMonth() - 5);
  const chartStartIso = chartStart.toISOString().slice(0, 10);

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
    agendamentosAtrasados,
    recomendacoesVencidas,
    financeiroPendente,
    visitasSeisMeses,
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
    supabase
      .from("agenda_visitas")
      .select("id, data_prevista, horario, produtores(nome), propriedades(nome)")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .eq("status", "agendada")
      .lt("data_prevista", hoje)
      .order("data_prevista", { ascending: true })
      .limit(5),
    supabase
      .from("recomendacoes")
      .select("id, recomendacao, prazo_sugerido, prioridade, visita_id")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .eq("status", "pendente")
      .lt("prazo_sugerido", hoje)
      .order("prazo_sugerido", { ascending: true })
      .limit(5),
    supabase
      .from("financeiro_visitas")
      .select("valor_final")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .eq("status_pagamento", "pendente"),
    supabase
      .from("visitas")
      .select("data_visita")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .gte("data_visita", chartStartIso),
  ]);

  const hectaresAcompanhados = (areasComHectares.data ?? []).reduce(
    (sum, a) => sum + (Number(a.area_ha) || 0),
    0
  );

  const aReceber = (financeiroPendente.data ?? []).reduce((sum, l) => sum + (l.valor_final ?? 0), 0);

  // Visitas agregadas por mês (últimos 6 meses), preenchendo meses sem visita
  const meses: { key: string; label: string; count: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(chartStart);
    d.setMonth(d.getMonth() + i);
    const key = d.toISOString().slice(0, 7);
    meses.push({
      key,
      label: d.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", ""),
      count: 0,
    });
  }
  for (const v of visitasSeisMeses.data ?? []) {
    const key = String(v.data_visita).slice(0, 7);
    const mes = meses.find((m) => m.key === key);
    if (mes) mes.count++;
  }

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
    agendamentosAtrasados: agendamentosAtrasados.data ?? [],
    recomendacoesVencidas: recomendacoesVencidas.data ?? [],
    aReceber,
    visitasPorMes: meses,
  };
}
