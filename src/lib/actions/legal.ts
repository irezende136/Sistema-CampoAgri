"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_TERMS_VERSION } from "@/lib/legal/constants";
import type { ActionState } from "@/lib/actions/auth";

export async function acceptTermsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const aceitos = formData.get("termos") === "on";
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  if (!aceitos) return { error: "É necessário marcar que você leu e concorda com os termos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      termos_aceitos_em: new Date().toISOString(),
      termos_versao: CURRENT_TERMS_VERSION,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  redirect(redirectTo || "/dashboard");
}
