"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canManageOrg } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";
import type { OrgRole } from "@/lib/auth/context";

export async function addTeamMemberAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  if (!canManageOrg(ctx.role)) return { error: "Apenas owners e administradores podem adicionar usuários." };

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "agronomo") as OrgRole;
  if (!email) return { error: "Informe o e-mail do usuário." };

  const supabase = await createClient();
  const { data: found, error: lookupError } = await supabase.rpc("find_user_by_email", { p_email: email });

  if (lookupError) return { error: lookupError.message };
  const user = Array.isArray(found) ? found[0] : found;
  if (!user) {
    return {
      error: "Nenhuma conta encontrada com este e-mail. Peça para a pessoa criar uma conta em /cadastro e tente novamente.",
    };
  }

  const { error } = await supabase.from("organization_users").insert({
    organization_id: ctx.organizationId,
    user_id: user.id,
    role,
    status: "ativo",
    data_entrada: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") return { error: "Este usuário já faz parte da organização." };
    return { error: error.message };
  }

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "convidar_usuario",
    p_entidade: "organization_users",
  });

  revalidatePath("/usuarios");
  return {};
}

export async function updateTeamMemberRoleAction(id: string, role: OrgRole) {
  const ctx = await requireOrgContext();
  if (!canManageOrg(ctx.role)) throw new Error("Sem permissão para alterar papéis.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_users")
    .update({ role })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath("/usuarios");
}

export async function updateTeamMemberStatusAction(id: string, status: "ativo" | "inativo") {
  const ctx = await requireOrgContext();
  if (!canManageOrg(ctx.role)) throw new Error("Sem permissão para alterar status de usuários.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_users")
    .update({ status })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath("/usuarios");
}
