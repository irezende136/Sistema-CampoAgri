import { getById, listWhere } from "./repo";

// Formatos locais das tabelas do fluxo de visita. Espelham as colunas do
// Postgres, mas lidos do IndexedDB (funcionam sem sinal).

export type VisitaLocal = {
  id: string;
  produtor_id: string;
  propriedade_id: string;
  data_visita: string;
  hora_inicial: string | null;
  hora_final: string | null;
  objetivo: string | null;
  condicoes_climaticas: string | null;
  resumo_geral: string | null;
  proximas_acoes: string | null;
  observacoes_finais: string | null;
  status: string;
  deleted_at?: string | null;
};

export type AvaliacaoLocal = {
  id: string;
  visita_id: string;
  area_id: string;
  safra_id: string | null;
  estadio_fenologico: string | null;
  vigor: string | null;
  necessidade_intervencao: boolean | null;
  [k: string]: unknown;
};

export type OcorrenciaLocal = {
  id: string;
  visita_id: string;
  area_id: string;
  tipo: string;
  severidade: string;
  status: string;
  descricao: string | null;
  [k: string]: unknown;
};

export type RecomendacaoLocal = {
  id: string;
  visita_id: string;
  area_id: string | null;
  categoria: string;
  recomendacao: string;
  prioridade: string;
  status: string;
  [k: string]: unknown;
};

export type FotoLocal = {
  id: string;
  visita_id: string;
  area_id: string | null;
  storage_path: string;
  legenda: string | null;
};

export type LancamentoLocal = {
  id: string;
  visita_id: string | null;
  descricao: string;
  valor: number;
  valor_final: number;
  status_pagamento: string;
  data_lancamento: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  desconto_tipo: string | null;
  desconto_valor: number | null;
};

export type DadosVisita = {
  visita: VisitaLocal | null;
  produtor: { id: string; nome: string } | null;
  propriedade: { id: string; nome: string; latitude: number | null; longitude: number | null } | null;
  areas: { id: string; nome: string; tipo: string }[];
  avaliacoes: AvaliacaoLocal[];
  ocorrencias: OcorrenciaLocal[];
  recomendacoes: RecomendacaoLocal[];
  fotos: FotoLocal[];
  lancamentos: LancamentoLocal[];
};

/** Monta a visita inteira a partir do banco local, com um join manual. */
export async function carregarVisita(visitaId: string): Promise<DadosVisita> {
  const visita = await getById<VisitaLocal & { id: string }>("visitas", visitaId);

  if (!visita) {
    return {
      visita: null,
      produtor: null,
      propriedade: null,
      areas: [],
      avaliacoes: [],
      ocorrencias: [],
      recomendacoes: [],
      fotos: [],
      lancamentos: [],
    };
  }

  const [produtor, propriedade, areas, avaliacoes, ocorrencias, recomendacoes, fotos, lancamentos] =
    await Promise.all([
      getById<{ id: string; nome: string }>("produtores", visita.produtor_id),
      getById<{ id: string; nome: string; latitude: number | null; longitude: number | null }>(
        "propriedades",
        visita.propriedade_id
      ),
      listWhere<{ id: string; nome: string; tipo: string }>("areas", {
        propriedade_id: visita.propriedade_id,
      }),
      listWhere<AvaliacaoLocal>("avaliacoes_area", { visita_id: visitaId }),
      listWhere<OcorrenciaLocal>("ocorrencias", { visita_id: visitaId }),
      listWhere<RecomendacaoLocal>("recomendacoes", { visita_id: visitaId }),
      listWhere<FotoLocal>("fotos", { visita_id: visitaId }),
      listWhere<LancamentoLocal>("financeiro_visitas", { visita_id: visitaId }),
    ]);

  return {
    visita,
    produtor,
    propriedade,
    areas: areas.sort((a, b) => a.nome.localeCompare(b.nome)),
    avaliacoes,
    ocorrencias,
    recomendacoes,
    fotos,
    lancamentos,
  };
}

/** Nome da área, para exibir nas listas sem precisar de join do servidor. */
export function nomeDaArea(areas: { id: string; nome: string }[], areaId: string | null): string {
  if (!areaId) return "";
  return areas.find((a) => a.id === areaId)?.nome ?? "";
}
