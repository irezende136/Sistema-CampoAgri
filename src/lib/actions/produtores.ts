"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

function readProdutorPayload(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    cpf_cnpj: String(formData.get("cpf_cnpj") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    endereco: String(formData.get("endereco") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "").trim() || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function createProdutorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readProdutorPayload(formData);
  if (!payload.nome) return { error: "Informe o nome do produtor." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtores")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId, updated_by: ctx.userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "criar_produtor",
    p_entidade: "produtores",
    p_entidade_id: data.id,
  });

  revalidatePath("/produtores");
  redirect(`/produtores/${data.id}`);
}

export async function updateProdutorAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const payload = readProdutorPayload(formData);
  if (!payload.nome) return { error: "Informe o nome do produtor." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("produtores")
    .update({ ...payload, updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath("/produtores");
  revalidatePath(`/produtores/${id}`);
  redirect(`/produtores/${id}`);
}

export async function deleteProdutorAction(id: string) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir produtores.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("produtores")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "excluir_produtor",
    p_entidade: "produtores",
    p_entidade_id: id,
  });

  revalidatePath("/produtores");
  redirect("/produtores");
}
