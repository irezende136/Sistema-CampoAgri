"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

export async function createVisitaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const produtor_id = String(formData.get("produtor_id") ?? "");
  const propriedade_id = String(formData.get("propriedade_id") ?? "");
  const data_visita = String(formData.get("data_visita") ?? "").trim();
  const hora_inicial = String(formData.get("hora_inicial") ?? "").trim() || null;
  const objetivo = String(formData.get("objetivo") ?? "").trim() || null;
  const condicoes_climaticas = String(formData.get("condicoes_climaticas") ?? "").trim() || null;

  if (!produtor_id || !propriedade_id) return { error: "Selecione produtor e propriedade." };
  if (!data_visita) return { error: "Informe a data da visita." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visitas")
    .insert({
      organization_id: ctx.organizationId,
      produtor_id,
      propriedade_id,
      data_visita,
      hora_inicial,
      objetivo,
      condicoes_climaticas,
      responsavel_tecnico_id: ctx.userId,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "criar_visita",
    p_entidade: "visitas",
    p_entidade_id: data.id,
  });

  redirect(`/visitas/${data.id}`);
}

export async function updateVisitaInfoAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const data_visita = String(formData.get("data_visita") ?? "").trim();
  const hora_inicial = String(formData.get("hora_inicial") ?? "").trim() || null;
  const objetivo = String(formData.get("objetivo") ?? "").trim() || null;
  const condicoes_climaticas = String(formData.get("condicoes_climaticas") ?? "").trim() || null;

  if (!data_visita) return { error: "Informe a data da visita." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("visitas")
    .update({
      data_visita,
      hora_inicial,
      objetivo,
      condicoes_climaticas,
      updated_by: ctx.userId,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .eq("status", "rascunho");

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${id}`);
  redirect(`/visitas/${id}`);
}

export async function updateVisitaResumoAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("visitas")
    .update({
      hora_final: String(formData.get("hora_final") ?? "").trim() || null,
      resumo_geral: String(formData.get("resumo_geral") ?? "").trim() || null,
      proximas_acoes: String(formData.get("proximas_acoes") ?? "").trim() || null,
      observacoes_finais: String(formData.get("observacoes_finais") ?? "").trim() || null,
      updated_by: ctx.userId,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${id}`);
  return {};
}

export async function finalizarVisitaAction(id: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("visitas")
    .update({ status: "finalizada", updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "finalizar_visita",
    p_entidade: "visitas",
    p_entidade_id: id,
  });

  revalidatePath(`/visitas/${id}`);
  redirect(`/visitas/${id}`);
}

export async function deleteVisitaAction(id: string) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir visitas.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("visitas")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  revalidatePath("/visitas");
  redirect("/visitas");
}

// ---------------------------------------------------------------------------
// Avaliação de área
// ---------------------------------------------------------------------------

export async function addAreaAvaliacaoAction(visitaId: string, formData: FormData) {
  const ctx = await requireOrgContext();
  const areaId = String(formData.get("area_id") ?? "");
  if (!areaId) throw new Error("Selecione uma área.");

  const supabase = await createClient();

  const { data: safra } = await supabase
    .from("safras")
    .select("id")
    .eq("area_id", areaId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("avaliacoes_area")
    .insert({
      organization_id: ctx.organizationId,
      visita_id: visitaId,
      area_id: areaId,
      safra_id: safra?.id ?? null,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}/areas/${data.id}`);
}

export async function updateAvaliacaoAction(
  avaliacaoId: string,
  visitaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const { error } = await supabase
    .from("avaliacoes_area")
    .update({
      estadio_fenologico: str("estadio_fenologico"),
      desenvolvimento_geral: str("desenvolvimento_geral"),
      stand_plantas: str("stand_plantas"),
      uniformidade: str("uniformidade"),
      falhas_plantio: str("falhas_plantio"),
      acamamento: str("acamamento"),
      vigor: str("vigor"),
      umidade_solo: str("umidade_solo"),
      compactacao: str("compactacao"),
      plantas_daninhas: str("plantas_daninhas"),
      pragas: str("pragas"),
      doencas: str("doencas"),
      necessidade_intervencao: formData.get("necessidade_intervencao") === "on",
      observacoes_gerais: str("observacoes_gerais"),
      updated_by: ctx.userId,
    })
    .eq("id", avaliacaoId)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

export async function removeAvaliacaoAction(avaliacaoId: string, visitaId: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("avaliacoes_area")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", avaliacaoId)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

// ---------------------------------------------------------------------------
// Ocorrências
// ---------------------------------------------------------------------------

export async function createOcorrenciaAction(
  visitaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const area_id = String(formData.get("area_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "").trim();
  if (!area_id) return { error: "Selecione a área." };
  if (!tipo) return { error: "Informe o tipo de ocorrência." };

  const supabase = await createClient();
  const { data: safra } = await supabase
    .from("safras")
    .select("id")
    .eq("area_id", area_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const { error } = await supabase.from("ocorrencias").insert({
    organization_id: ctx.organizationId,
    visita_id: visitaId,
    area_id,
    safra_id: safra?.id ?? null,
    tipo,
    severidade: String(formData.get("severidade") ?? "baixa"),
    descricao: str("descricao"),
    recomendacao_tecnica: str("recomendacao_tecnica"),
    prazo_recomendado: str("prazo_recomendado"),
    produto_recomendado: str("produto_recomendado"),
    dose: str("dose"),
    responsavel_acao: str("responsavel_acao"),
    created_by: ctx.userId,
    updated_by: ctx.userId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

export async function updateOcorrenciaAction(
  id: string,
  visitaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const area_id = String(formData.get("area_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "").trim();
  if (!area_id) return { error: "Selecione a área." };
  if (!tipo) return { error: "Informe o tipo de ocorrência." };

  const supabase = await createClient();
  const { data: safra } = await supabase
    .from("safras")
    .select("id")
    .eq("area_id", area_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const { error } = await supabase
    .from("ocorrencias")
    .update({
      area_id,
      safra_id: safra?.id ?? null,
      tipo,
      severidade: String(formData.get("severidade") ?? "baixa"),
      descricao: str("descricao"),
      recomendacao_tecnica: str("recomendacao_tecnica"),
      prazo_recomendado: str("prazo_recomendado"),
      produto_recomendado: str("produto_recomendado"),
      dose: str("dose"),
      responsavel_acao: str("responsavel_acao"),
      updated_by: ctx.userId,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

export async function updateOcorrenciaStatusAction(id: string, visitaId: string, status: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("ocorrencias")
    .update({ status, updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${visitaId}`);
}

export async function removeOcorrenciaAction(id: string, visitaId: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("ocorrencias")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

// ---------------------------------------------------------------------------
// Recomendações
// ---------------------------------------------------------------------------

export async function createRecomendacaoAction(
  visitaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const categoria = String(formData.get("categoria") ?? "");
  const recomendacao = String(formData.get("recomendacao") ?? "").trim();
  if (!categoria) return { error: "Selecione a categoria." };
  if (!recomendacao) return { error: "Descreva a recomendação." };

  const area_id = String(formData.get("area_id") ?? "") || null;
  const supabase = await createClient();

  let safra_id: string | null = null;
  if (area_id) {
    const { data: safra } = await supabase
      .from("safras")
      .select("id")
      .eq("area_id", area_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    safra_id = safra?.id ?? null;
  }

  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const { error } = await supabase.from("recomendacoes").insert({
    organization_id: ctx.organizationId,
    visita_id: visitaId,
    area_id,
    safra_id,
    categoria,
    recomendacao,
    prioridade: String(formData.get("prioridade") ?? "media"),
    prazo_sugerido: str("prazo_sugerido"),
    produto_sugerido: str("produto_sugerido"),
    dose: str("dose"),
    volume_calda: str("volume_calda"),
    area_aplicar: str("area_aplicar"),
    observacoes: str("observacoes"),
    created_by: ctx.userId,
    updated_by: ctx.userId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

export async function updateRecomendacaoAction(
  id: string,
  visitaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const categoria = String(formData.get("categoria") ?? "");
  const recomendacao = String(formData.get("recomendacao") ?? "").trim();
  if (!categoria) return { error: "Selecione a categoria." };
  if (!recomendacao) return { error: "Descreva a recomendação." };

  const area_id = String(formData.get("area_id") ?? "") || null;
  const supabase = await createClient();

  let safra_id: string | null = null;
  if (area_id) {
    const { data: safra } = await supabase
      .from("safras")
      .select("id")
      .eq("area_id", area_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    safra_id = safra?.id ?? null;
  }

  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const { error } = await supabase
    .from("recomendacoes")
    .update({
      area_id,
      safra_id,
      categoria,
      recomendacao,
      prioridade: String(formData.get("prioridade") ?? "media"),
      prazo_sugerido: str("prazo_sugerido"),
      produto_sugerido: str("produto_sugerido"),
      dose: str("dose"),
      volume_calda: str("volume_calda"),
      area_aplicar: str("area_aplicar"),
      observacoes: str("observacoes"),
      updated_by: ctx.userId,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}

export async function updateRecomendacaoStatusAction(id: string, visitaId: string, status: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("recomendacoes")
    .update({ status, updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${visitaId}`);
}

export async function removeRecomendacaoAction(id: string, visitaId: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("recomendacoes")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${visitaId}`);
  redirect(`/visitas/${visitaId}`);
}
