function clamp(value: number): number {
  return Math.min(255, Math.max(0, value));
}

/** Escurece uma cor hex (#rrggbb) em uma porcentagem (0–1). */
export function darkenHex(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const num = parseInt(match[1], 16);
  const r = clamp(((num >> 16) & 0xff) * (1 - amount));
  const g = clamp(((num >> 8) & 0xff) * (1 - amount));
  const b = clamp((num & 0xff) * (1 - amount));
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

/** Decide se texto branco ou escuro tem melhor contraste sobre a cor de fundo. */
export function readableTextColor(hex: string): "#ffffff" | "#1f2421" {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return "#ffffff";
  const num = parseInt(match[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1f2421" : "#ffffff";
}
