"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

function readPayload(formData: FormData) {
  const num = (key: string) => (formData.get(key) ? Number(formData.get(key)) : null);
  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;
  const date = (key: string) => str(key);

  return {
    area_id: String(formData.get("area_id") ?? ""),
    propriedade_id: String(formData.get("propriedade_id") ?? ""),
    nome: str("nome") ?? "",
    cultura: str("cultura") ?? "",
    finalidade: str("finalidade"),
    cultivar: str("cultivar"),
    data_prevista_plantio: date("data_prevista_plantio"),
    data_real_plantio: date("data_real_plantio"),
    data_prevista_colheita: date("data_prevista_colheita"),
    data_real_colheita: date("data_real_colheita"),
    populacao_planejada: num("populacao_planejada"),
    espacamento: num("espacamento"),
    profundidade_plantio: num("profundidade_plantio"),
    sistema_plantio: str("sistema_plantio"),
    status: str("status") ?? "planejada",
    observacoes: str("observacoes"),
  };
}

export async function createSafraAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  if (!payload.nome) return { error: "Informe o nome da safra/ciclo." };
  if (!payload.cultura) return { error: "Informe a cultura." };
  if (!payload.area_id || !payload.propriedade_id) return { error: "Área não informada." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("safras")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId, updated_by: ctx.userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/areas/${payload.area_id}`);
  redirect(`/safras/${data.id}`);
}

export async function updateSafraAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  if (!payload.nome) return { error: "Informe o nome da safra/ciclo." };

  const supabase = await createClient();
  // area_id/propriedade_id não podem ser trocados na edição
  const { area_id: _a, propriedade_id: _p, ...rest } = payload;
  void _a;
  void _p;
  const { error } = await supabase
    .from("safras")
    .update({ ...rest, updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/safras/${id}`);
  redirect(`/safras/${id}`);
}

export async function deleteSafraAction(id: string, areaId: string) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir safras.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("safras")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/areas/${areaId}`);
  redirect(`/areas/${areaId}`);
}

export async function upsertPlanejamentoAction(
  safraId: string,
  areaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const payload = {
    safra_id: safraId,
    area_id: areaId,
    organization_id: ctx.organizationId,
    cultivar: String(formData.get("cultivar") ?? "").trim() || null,
    sementes_por_ha: formData.get("sementes_por_ha") ? Number(formData.get("sementes_por_ha")) : null,
    espacamento: formData.get("espacamento") ? Number(formData.get("espacamento")) : null,
    profundidade: formData.get("profundidade") ? Number(formData.get("profundidade")) : null,
    tratamento_sementes: String(formData.get("tratamento_sementes") ?? "").trim() || null,
    adubacao_base: String(formData.get("adubacao_base") ?? "").trim() || null,
    adubacao_cobertura: String(formData.get("adubacao_cobertura") ?? "").trim() || null,
    produtos_previstos: String(formData.get("produtos_previstos") ?? "").trim() || null,
    custo_estimado_ha: formData.get("custo_estimado_ha") ? Number(formData.get("custo_estimado_ha")) : null,
    custo_total_estimado: formData.get("custo_total_estimado") ? Number(formData.get("custo_total_estimado")) : null,
    observacoes_tecnicas: String(formData.get("observacoes_tecnicas") ?? "").trim() || null,
    updated_by: ctx.userId,
  };

  const { data: existing } = await supabase
    .from("planejamento_plantio")
    .select("id")
    .eq("safra_id", safraId)
    .is("deleted_at", null)
    .maybeSingle();

  const query = existing
    ? supabase.from("planejamento_plantio").update(payload).eq("id", existing.id)
    : supabase.from("planejamento_plantio").insert({ ...payload, created_by: ctx.userId });

  const { error } = await query;
  if (error) return { error: error.message };

  revalidatePath(`/safras/${safraId}`);
  redirect(`/safras/${safraId}`);
}
