"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

export async function createInsumoAction(
  safraId: string,
  areaId: string,
  propriedadeId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();

  const tipo_insumo = String(formData.get("tipo_insumo") ?? "");
  const nome_insumo = String(formData.get("nome_insumo") ?? "").trim();
  if (!tipo_insumo) return { error: "Selecione o tipo de insumo." };
  if (!nome_insumo) return { error: "Informe o nome do insumo." };

  const num = (key: string) => {
    const raw = formData.get(key);
    return raw !== null && raw !== "" ? Number(raw) : null;
  };

  const quantidade_ha = num("quantidade_ha");
  const preco_unitario = num("preco_unitario");
  const unidade = String(formData.get("unidade") ?? "").trim() || null;
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;

  const { data: area } = await fetchAreaHa(propriedadeId, areaId, ctx.organizationId);
  const area_total = area?.area_ha ?? null;
  const custo_ha = quantidade_ha !== null && preco_unitario !== null ? quantidade_ha * preco_unitario : null;
  const custo_total = custo_ha !== null && area_total !== null ? custo_ha * area_total : null;

  const supabase = await createClient();
  const { error } = await supabase.from("insumos_custos").insert({
    organization_id: ctx.organizationId,
    propriedade_id: propriedadeId,
    area_id: areaId,
    safra_id: safraId,
    tipo_insumo,
    nome_insumo,
    quantidade_ha,
    unidade,
    preco_unitario,
    custo_ha,
    area_total,
    custo_total,
    observacoes,
    created_by: ctx.userId,
    updated_by: ctx.userId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/safras/${safraId}`);
  return undefined;
}

async function fetchAreaHa(propriedadeId: string, areaId: string, organizationId: string) {
  const supabase = await createClient();
  return supabase
    .from("areas")
    .select("area_ha")
    .eq("id", areaId)
    .eq("propriedade_id", propriedadeId)
    .eq("organization_id", organizationId)
    .maybeSingle();
}

export async function deleteInsumoAction(id: string, safraId: string) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir insumos/custos.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("insumos_custos")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/safras/${safraId}`);
}
