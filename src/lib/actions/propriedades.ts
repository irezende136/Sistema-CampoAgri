"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

function readPayload(formData: FormData) {
  return {
    produtor_id: String(formData.get("produtor_id") ?? ""),
    nome: String(formData.get("nome") ?? "").trim(),
    municipio: String(formData.get("municipio") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "").trim() || null,
    localizacao: String(formData.get("localizacao") ?? "").trim() || null,
    area_total_ha: formData.get("area_total_ha") ? Number(formData.get("area_total_ha")) : null,
    tipo_atividade: String(formData.get("tipo_atividade") ?? "") || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function createPropriedadeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  if (!payload.nome) return { error: "Informe o nome da propriedade." };
  if (!payload.produtor_id) return { error: "Produtor não informado." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propriedades")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId, updated_by: ctx.userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "criar_propriedade",
    p_entidade: "propriedades",
    p_entidade_id: data.id,
  });

  revalidatePath(`/produtores/${payload.produtor_id}`);
  redirect(`/propriedades/${data.id}`);
}

export async function updatePropriedadeAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  if (!payload.nome) return { error: "Informe o nome da propriedade." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("propriedades")
    .update({ ...payload, updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/propriedades/${id}`);
  redirect(`/propriedades/${id}`);
}

export async function deletePropriedadeAction(id: string, produtorId: string) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir propriedades.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("propriedades")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/produtores/${produtorId}`);
  redirect(`/produtores/${produtorId}`);
}
