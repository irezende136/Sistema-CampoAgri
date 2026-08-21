"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

function readPayload(formData: FormData) {
  return {
    produtor_id: String(formData.get("produtor_id") ?? "").trim() || null,
    nome: String(formData.get("nome") ?? "").trim(),
    municipio: String(formData.get("municipio") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "").trim() || null,
    localizacao: String(formData.get("localizacao") ?? "").trim() || null,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    area_total_ha: formData.get("area_total_ha") ? Number(formData.get("area_total_ha")) : null,
    tipo_atividade: String(formData.get("tipo_atividade") ?? "") || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function createPropriedadeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  const produtorId = payload.produtor_id;
  if (!payload.nome) return { error: "Informe o nome da propriedade." };
  if (!produtorId) return { error: "Produtor não informado." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propriedades")
    .insert({
      ...payload,
      produtor_id: produtorId,
      organization_id: ctx.organizationId,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    })
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
  // O produtor nao muda na edicao (o select fica disabled no formulario e,
  // por isso, nem chega no FormData) — nao deve ir no update.
  const { produtor_id: _produtorId, ...rest } = payload;
  void _produtorId;
  const { error } = await supabase
    .from("propriedades")
    .update({ ...rest, updated_by: ctx.userId })
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
