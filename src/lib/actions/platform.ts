"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin, requireTermsAccepted } from "@/lib/auth/context";

export async function updateOrgStatusAction(organizationId: string, status: string) {
  await requireTermsAccepted();
  await requirePlatformAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("organizations")
    .update({ status_assinatura: status })
    .eq("id", organizationId);

  if (error) throw new Error(error.message);

  await supabase.rpc("log_action", {
    p_organization_id: organizationId,
    p_acao: "alterar_status_assinatura",
    p_entidade: "organizations",
    p_entidade_id: organizationId,
    p_detalhes: { novo_status: status },
  });

  revalidatePath("/super-admin/organizacoes");
  revalidatePath(`/super-admin/organizacoes/${organizationId}`);
}

export async function updateOrgPlanAction(organizationId: string, plano: string) {
  await requireTermsAccepted();
  await requirePlatformAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("organizations").update({ plano }).eq("id", organizationId);
  if (error) throw new Error(error.message);

  await supabase.rpc("log_action", {
    p_organization_id: organizationId,
    p_acao: "alterar_plano",
    p_entidade: "organizations",
    p_entidade_id: organizationId,
    p_detalhes: { novo_plano: plano },
  });

  revalidatePath(`/super-admin/organizacoes/${organizationId}`);
}
