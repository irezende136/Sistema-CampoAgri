import { create, update, remove, type Ctx } from "./repo";

// Cadastros gravando no banco local. Um produtor ou propriedade criado sem
// sinal já nasce com id definitivo, então é possível abrir uma visita nele
// na sequência, ainda offline.

// ---------------------------------------------------------------------------
// Produtores
// ---------------------------------------------------------------------------

export async function criarProdutorLocal(ctx: Ctx, dados: Record<string, unknown>) {
  return create("produtores", ctx, { ...dados, status: dados.status ?? "ativo" });
}

export async function atualizarProdutorLocal(ctx: Ctx, id: string, dados: Record<string, unknown>) {
  return update("produtores", ctx, id, dados);
}

export async function removerProdutorLocal(ctx: Ctx, id: string) {
  return remove("produtores", ctx, id);
}

// ---------------------------------------------------------------------------
// Propriedades
// ---------------------------------------------------------------------------

export async function criarPropriedadeLocal(ctx: Ctx, dados: Record<string, unknown>) {
  return create("propriedades", ctx, dados);
}

export async function atualizarPropriedadeLocal(ctx: Ctx, id: string, dados: Record<string, unknown>) {
  // produtor_id não muda na edição — a propriedade não troca de dono.
  const { produtor_id: _p, ...resto } = dados;
  void _p;
  return update("propriedades", ctx, id, resto);
}

export async function removerPropriedadeLocal(ctx: Ctx, id: string) {
  return remove("propriedades", ctx, id);
}

// ---------------------------------------------------------------------------
// Áreas / talhões
// ---------------------------------------------------------------------------

export async function criarAreaLocal(ctx: Ctx, dados: Record<string, unknown>) {
  return create("areas", ctx, { ...dados, status: dados.status ?? "ativa" });
}

export async function atualizarAreaLocal(ctx: Ctx, id: string, dados: Record<string, unknown>) {
  const { propriedade_id: _p, ...resto } = dados;
  void _p;
  return update("areas", ctx, id, resto);
}

export async function removerAreaLocal(ctx: Ctx, id: string) {
  return remove("areas", ctx, id);
}

// ---------------------------------------------------------------------------
// Safras
// ---------------------------------------------------------------------------

export async function criarSafraLocal(ctx: Ctx, dados: Record<string, unknown>) {
  return create("safras", ctx, { ...dados, status: dados.status ?? "planejada" });
}

export async function atualizarSafraLocal(ctx: Ctx, id: string, dados: Record<string, unknown>) {
  const { area_id: _a, propriedade_id: _p, ...resto } = dados;
  void _a;
  void _p;
  return update("safras", ctx, id, resto);
}

export async function removerSafraLocal(ctx: Ctx, id: string) {
  return remove("safras", ctx, id);
}

// ---------------------------------------------------------------------------
// Planejamento de plantio (1 por safra)
// ---------------------------------------------------------------------------

export async function salvarPlanejamentoLocal(
  ctx: Ctx,
  safraId: string,
  areaId: string,
  existenteId: string | null,
  dados: Record<string, unknown>
) {
  if (existenteId) return update("planejamento_plantio", ctx, existenteId, dados);
  return create("planejamento_plantio", ctx, { ...dados, safra_id: safraId, area_id: areaId });
}

// ---------------------------------------------------------------------------
// Insumos e custos
// ---------------------------------------------------------------------------

export async function criarInsumoLocal(ctx: Ctx, dados: Record<string, unknown>) {
  return create("insumos_custos", ctx, dados);
}

export async function removerInsumoLocal(ctx: Ctx, id: string) {
  return remove("insumos_custos", ctx, id);
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------

export async function criarAgendamentoLocal(ctx: Ctx, dados: Record<string, unknown>) {
  return create("agenda_visitas", ctx, { ...dados, status: "agendada" });
}

export async function atualizarStatusAgendamentoLocal(ctx: Ctx, id: string, status: string) {
  return update("agenda_visitas", ctx, id, { status });
}

export async function removerAgendamentoLocal(ctx: Ctx, id: string) {
  return remove("agenda_visitas", ctx, id);
}
