"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";

export async function createFotoAction(input: {
  visitaId: string;
  propriedadeId?: string | null;
  areaId?: string | null;
  ocorrenciaId?: string | null;
  storagePath: string;
  legenda?: string | null;
}) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { error } = await supabase.from("fotos").insert({
    organization_id: ctx.organizationId,
    visita_id: input.visitaId,
    propriedade_id: input.propriedadeId ?? null,
    area_id: input.areaId ?? null,
    ocorrencia_id: input.ocorrenciaId ?? null,
    storage_path: input.storagePath,
    legenda: input.legenda ?? null,
    created_by: ctx.userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${input.visitaId}`);
}

export async function deleteFotoAction(id: string, visitaId: string) {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("fotos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(`/visitas/${visitaId}`);
}
