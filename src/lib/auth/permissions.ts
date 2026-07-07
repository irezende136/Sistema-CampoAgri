import type { OrgRole } from "@/lib/auth/context";

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Administrador",
  agronomo: "Agrônomo",
  tecnico: "Técnico",
  assistente: "Assistente",
  viewer: "Visualizador",
};

export function canWrite(role: OrgRole): boolean {
  return role !== "viewer";
}

export function canManageOrg(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

export function canDelete(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

export function isOwner(role: OrgRole): boolean {
  return role === "owner";
}
