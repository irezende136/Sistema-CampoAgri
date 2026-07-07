"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canManageOrg } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

export async function createOrganizationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const telefone = String(formData.get("telefone") ?? "").trim() || null;
  const cidade = String(formData.get("cidade") ?? "").trim() || null;
  const estado = String(formData.get("estado") ?? "").trim() || null;

  if (!nome) return { error: "Informe o nome da organização ou do seu escritório." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("create_organization", {
    p_nome: nome,
    p_email: email ?? undefined,
    p_telefone: telefone ?? undefined,
    p_cidade: cidade ?? undefined,
    p_estado: estado ?? undefined,
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function updateOrganizationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();
  if (!canManageOrg(ctx.role)) return { error: "Você não tem permissão para editar a organização." };

  const supabase = await createClient();
  const payload = {
    nome: String(formData.get("nome") ?? "").trim(),
    nome_comercial: String(formData.get("nome_comercial") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "").trim() || null,
    registro_profissional: String(formData.get("registro_profissional") ?? "").trim() || null,
  };

  const { error } = await supabase
    .from("organizations")
    .update(payload)
    .eq("id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { error: undefined };
}

export async function updateOrganizationImageAction(field: "logo_url" | "assinatura_url", storagePath: string) {
  const ctx = await requireOrgContext();
  if (!canManageOrg(ctx.role)) throw new Error("Você não tem permissão para editar a organização.");

  const supabase = await createClient();
  const payload = field === "logo_url" ? { logo_url: storagePath } : { assinatura_url: storagePath };
  const { error } = await supabase.from("organizations").update(payload).eq("id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}
