import type { Badge } from "@/components/ui/badge";

type Tone = Parameters<typeof Badge>[0]["tone"];

const map: Record<string, Tone> = {
  ativa: "success",
  ativo: "success",
  em_reforma: "warning",
  em_pousio: "neutral",
  colhida: "info",
  encerrada: "neutral",
  planejada: "neutral",
  plantada: "info",
  em_desenvolvimento: "success",
  rascunho: "neutral",
  finalizada: "success",
  relatorio_gerado: "primary",
  identificado: "warning",
  recomendado: "warning",
  em_execucao: "info",
  resolvido: "success",
  pendente: "warning",
  pago: "success",
  cancelado: "neutral",
  executada: "success",
  cancelada: "neutral",
  agendada: "info",
  realizada: "success",
  baixa: "neutral",
  media: "warning",
  alta: "warning",
  urgente: "danger",
  critica: "danger",
  trial: "info",
  active: "success",
  past_due: "warning",
  canceled: "neutral",
  suspended: "danger",
};

export function statusTone(status: string | null | undefined): Tone {
  if (!status) return "neutral";
  return map[status] ?? "neutral";
}

export const STATUS_LABELS: Record<string, string> = {
  ativa: "Ativa",
  em_reforma: "Em reforma",
  em_pousio: "Em pousio",
  colhida: "Colhida",
  encerrada: "Encerrada",
  planejada: "Planejada",
  plantada: "Plantada",
  em_desenvolvimento: "Em desenvolvimento",
  rascunho: "Rascunho",
  finalizada: "Finalizada",
  relatorio_gerado: "Relatório gerado",
  identificado: "Identificado",
  recomendado: "Recomendado",
  em_execucao: "Em execução",
  resolvido: "Resolvido",
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
  executada: "Executada",
  cancelada: "Cancelada",
  agendada: "Agendada",
  realizada: "Realizada",
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
  critica: "Crítica",
  trial: "Trial",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  suspended: "Suspensa",
};

export function statusLabel(status: string | null | undefined): string {
  if (!status) return "-";
  return STATUS_LABELS[status] ?? status;
}
