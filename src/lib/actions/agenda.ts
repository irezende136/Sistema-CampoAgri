"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import type { ActionState } from "@/lib/actions/auth";

export async function createAgendamentoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireOrgContext();
  const produtor_id = String(formData.get("produtor_id") ?? "");
  const propriedade_id = String(formData.get("propriedade_id") ?? "");
  const data_prevista = String(formData.get("data_prevista") ?? "").trim();
  const horario = String(formData.get("horario") ?? "").trim() || null;
  const objetivo = String(formData.get("objetivo") ?? "").trim() || null;
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;

  if (!produtor_id || !propriedade_id) return { error: "Selecione produtor e propriedade." };
  if (!data_prevista) return { error: "Informe a data prevista." };

  const supabase = await createClient();
  const { error } = await supabase.from("agenda_visitas").insert({
    organization_id: ctx.organizationId,
    produtor_id,
    propriedade_id,
    data_prevista,
    horario,
    objetivo,
    observacoes,
    created_by: ctx.userId,
    updated_by: ctx.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/agenda");
  redirect("/agenda");
}

export async function updateAgendamentoStatusAction(id: string, status: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("agenda_visitas")
    .update({ status, updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath("/agenda");
}

export async function deleteAgendamentoAction(id: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("agenda_visitas")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath("/agenda");
}
