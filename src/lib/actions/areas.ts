"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

function readPayload(formData: FormData) {
  return {
    propriedade_id: String(formData.get("propriedade_id") ?? ""),
    nome: String(formData.get("nome") ?? "").trim(),
    tipo: String(formData.get("tipo") ?? ""),
    area_ha: formData.get("area_ha") ? Number(formData.get("area_ha")) : null,
    status: String(formData.get("status") ?? "ativa"),
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function createAreaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  if (!payload.nome) return { error: "Informe o nome da área." };
  if (!payload.propriedade_id) return { error: "Propriedade não informada." };
  if (!payload.tipo) return { error: "Selecione o tipo de área." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("areas")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId, updated_by: ctx.userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/propriedades/${payload.propriedade_id}`);
  redirect(`/areas/${data.id}`);
}

export async function updateAreaAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readPayload(formData);
  if (!payload.nome) return { error: "Informe o nome da área." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("areas")
    .update({
      nome: payload.nome,
      tipo: payload.tipo,
      area_ha: payload.area_ha,
      status: payload.status,
      observacoes: payload.observacoes,
      updated_by: ctx.userId,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath(`/areas/${id}`);
  redirect(`/areas/${id}`);
}

export async function deleteAreaAction(id: string, propriedadeId: string) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir áreas.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("areas")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/propriedades/${propriedadeId}`);
  redirect(`/propriedades/${propriedadeId}`);
}
