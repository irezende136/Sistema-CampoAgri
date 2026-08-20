export function formatDateBR(date: string | null | undefined): string {
  if (!date) return "-";
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTimeBR(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Data de "hoje" no fuso do Brasil (YYYY-MM-DD) — o servidor roda em UTC,
// então new Date().toISOString() vira o dia seguinte a partir das 21h no Brasil.
export function todayInSaoPauloISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatHectares(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString("pt-BR")} ha`;
}

export function toDateInputValue(date: string | null | undefined): string {
  if (!date) return "";
  return date.slice(0, 10);
}
