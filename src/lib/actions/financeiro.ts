"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/auth/context";
import { canDelete } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/auth";

// Desconto nunca ultrapassa o valor: total mínimo é 0.
function calcValorFinal(valor: number, descontoTipo: string | null, descontoValor: number | null): number {
  if (!descontoTipo || !descontoValor || descontoValor <= 0) return valor;
  const desconto = descontoTipo === "percentual" ? (valor * descontoValor) / 100 : descontoValor;
  return Math.max(0, Math.round((valor - desconto) * 100) / 100);
}

export async function createLancamentoAction(
  contexto: { visitaId?: string | null; produtorId: string; propriedadeId?: string | null },
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ctx = await requireOrgContext();

  const descricao = String(formData.get("descricao") ?? "").trim();
  if (!descricao) return { error: "Informe a descrição do serviço/cobrança." };

  const valor = Number(formData.get("valor"));
  if (!Number.isFinite(valor) || valor < 0) return { error: "Informe um valor válido." };

  const descontoValorRaw = formData.get("desconto_valor");
  const desconto_valor = descontoValorRaw !== null && descontoValorRaw !== "" ? Number(descontoValorRaw) : null;
  const desconto_tipo = desconto_valor ? String(formData.get("desconto_tipo") ?? "valor") : null;
  if (desconto_valor !== null && (!Number.isFinite(desconto_valor) || desconto_valor < 0)) {
    return { error: "Desconto inválido." };
  }
  if (desconto_tipo === "percentual" && desconto_valor !== null && desconto_valor > 100) {
    return { error: "Desconto percentual não pode passar de 100%." };
  }

  const forma_pagamento = String(formData.get("forma_pagamento") ?? "").trim() || null;
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("financeiro_visitas").insert({
    organization_id: ctx.organizationId,
    produtor_id: contexto.produtorId,
    propriedade_id: contexto.propriedadeId ?? null,
    visita_id: contexto.visitaId ?? null,
    descricao,
    valor,
    desconto_tipo,
    desconto_valor,
    valor_final: calcValorFinal(valor, desconto_tipo, desconto_valor),
    forma_pagamento,
    observacoes,
    created_by: ctx.userId,
    updated_by: ctx.userId,
  });

  if (error) return { error: error.message };

  if (contexto.visitaId) revalidatePath(`/visitas/${contexto.visitaId}`);
  revalidatePath("/financeiro");
  return undefined;
}

export async function updateLancamentoStatusAction(id: string, status: string, visitaId?: string | null) {
  if (!["pendente", "pago", "cancelado"].includes(status)) throw new Error("Status inválido.");

  const ctx = await requireOrgContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("financeiro_visitas")
    .update({
      status_pagamento: status,
      data_pagamento: status === "pago" ? new Date().toISOString().slice(0, 10) : null,
      updated_by: ctx.userId,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  if (visitaId) revalidatePath(`/visitas/${visitaId}`);
  revalidatePath("/financeiro");
}

export async function deleteLancamentoAction(id: string, visitaId?: string | null) {
  const ctx = await requireOrgContext();
  if (!canDelete(ctx.role)) throw new Error("Sem permissão para excluir lançamentos.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("financeiro_visitas")
    .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) throw new Error(error.message);

  if (visitaId) revalidatePath(`/visitas/${visitaId}`);
  revalidatePath("/financeiro");
}
