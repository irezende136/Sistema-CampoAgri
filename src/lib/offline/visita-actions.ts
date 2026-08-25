import { create, update, remove, listWhere, type Ctx } from "./repo";

// Operações do fluxo de visita gravando primeiro no aparelho. Todas funcionam
// sem sinal; a subida para o servidor fica a cargo da fila de sincronização.

export async function criarVisitaLocal(
  ctx: Ctx,
  dados: {
    produtor_id: string;
    propriedade_id: string;
    data_visita: string;
    hora_inicial?: string | null;
    objetivo?: string | null;
    condicoes_climaticas?: string | null;
  }
) {
  return create("visitas", ctx, {
    ...dados,
    hora_inicial: dados.hora_inicial ?? null,
    objetivo: dados.objetivo ?? null,
    condicoes_climaticas: dados.condicoes_climaticas ?? null,
    responsavel_tecnico_id: ctx.userId,
    status: "rascunho",
  });
}

export async function atualizarVisitaLocal(ctx: Ctx, id: string, mudancas: Record<string, unknown>) {
  return update("visitas", ctx, id, mudancas);
}

export async function finalizarVisitaLocal(ctx: Ctx, id: string) {
  return update("visitas", ctx, id, { status: "finalizada" });
}

export async function excluirVisitaLocal(ctx: Ctx, id: string) {
  return remove("visitas", ctx, id);
}

// ---------------------------------------------------------------------------
// Avaliação de área
// ---------------------------------------------------------------------------

export async function adicionarAvaliacaoLocal(
  ctx: Ctx,
  visitaId: string,
  areaId: string
) {
  // Vincula à safra mais recente da área, como faz a versão do servidor.
  const safras = await listWhere<{ id: string; created_at?: string }>("safras", { area_id: areaId });
  const safra = safras.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")))[0];

  return create("avaliacoes_area", ctx, {
    visita_id: visitaId,
    area_id: areaId,
    safra_id: safra?.id ?? null,
  });
}

export async function atualizarAvaliacaoLocal(ctx: Ctx, id: string, mudancas: Record<string, unknown>) {
  return update("avaliacoes_area", ctx, id, mudancas);
}

export async function removerAvaliacaoLocal(ctx: Ctx, id: string) {
  return remove("avaliacoes_area", ctx, id);
}

// ---------------------------------------------------------------------------
// Ocorrências
// ---------------------------------------------------------------------------

async function safraDaArea(areaId: string | null): Promise<string | null> {
  if (!areaId) return null;
  const safras = await listWhere<{ id: string; created_at?: string }>("safras", { area_id: areaId });
  const safra = safras.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")))[0];
  return safra?.id ?? null;
}

export async function criarOcorrenciaLocal(
  ctx: Ctx,
  visitaId: string,
  dados: Record<string, unknown>
) {
  return create("ocorrencias", ctx, {
    ...dados,
    visita_id: visitaId,
    safra_id: await safraDaArea(dados.area_id as string),
    status: "identificado",
  });
}

export async function atualizarOcorrenciaLocal(ctx: Ctx, id: string, dados: Record<string, unknown>) {
  return update("ocorrencias", ctx, id, {
    ...dados,
    safra_id: await safraDaArea(dados.area_id as string),
  });
}

export async function removerOcorrenciaLocal(ctx: Ctx, id: string) {
  return remove("ocorrencias", ctx, id);
}

// ---------------------------------------------------------------------------
// Recomendações
// ---------------------------------------------------------------------------

export async function criarRecomendacaoLocal(
  ctx: Ctx,
  visitaId: string,
  dados: Record<string, unknown>
) {
  const areaId = (dados.area_id as string) || null;
  return create("recomendacoes", ctx, {
    ...dados,
    area_id: areaId,
    visita_id: visitaId,
    safra_id: await safraDaArea(areaId),
    status: "pendente",
  });
}

export async function atualizarRecomendacaoLocal(ctx: Ctx, id: string, dados: Record<string, unknown>) {
  const areaId = (dados.area_id as string) || null;
  return update("recomendacoes", ctx, id, {
    ...dados,
    area_id: areaId,
    safra_id: await safraDaArea(areaId),
  });
}

export async function removerRecomendacaoLocal(ctx: Ctx, id: string) {
  return remove("recomendacoes", ctx, id);
}

// ---------------------------------------------------------------------------
// Financeiro
// ---------------------------------------------------------------------------

export function calcValorFinal(
  valor: number,
  descontoTipo: string | null,
  descontoValor: number | null
): number {
  if (!descontoTipo || !descontoValor || descontoValor <= 0) return valor;
  const desconto = descontoTipo === "percentual" ? (valor * descontoValor) / 100 : descontoValor;
  return Math.max(0, Math.round((valor - desconto) * 100) / 100);
}

export async function criarLancamentoLocal(
  ctx: Ctx,
  dados: {
    visita_id: string | null;
    produtor_id: string;
    propriedade_id: string | null;
    descricao: string;
    valor: number;
    desconto_tipo: string | null;
    desconto_valor: number | null;
    forma_pagamento: string | null;
    observacoes: string | null;
  }
) {
  return create("financeiro_visitas", ctx, {
    ...dados,
    valor_final: calcValorFinal(dados.valor, dados.desconto_tipo, dados.desconto_valor),
    status_pagamento: "pendente",
    data_lancamento: new Date().toISOString().slice(0, 10),
  });
}

export async function atualizarStatusLancamentoLocal(ctx: Ctx, id: string, status: string) {
  return update("financeiro_visitas", ctx, id, {
    status_pagamento: status,
    data_pagamento: status === "pago" ? new Date().toISOString().slice(0, 10) : null,
  });
}

export async function removerLancamentoLocal(ctx: Ctx, id: string) {
  return remove("financeiro_visitas", ctx, id);
}

// ---------------------------------------------------------------------------
// Fotos
// ---------------------------------------------------------------------------

export async function removerFotoLocal(ctx: Ctx, id: string) {
  return remove("fotos", ctx, id);
}
