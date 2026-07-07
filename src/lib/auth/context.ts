import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrgRole = Database["public"]["Tables"]["organization_users"]["Row"]["role"];

export type OrgContext = {
  userId: string;
  email: string | null;
  organizationId: string;
  organization: Database["public"]["Tables"]["organizations"]["Row"];
  role: OrgRole;
  isPlatformAdmin: boolean;
};

/**
 * Carrega o contexto do usuário autenticado: organização ativa + papel.
 * V1 assume um usuário por organização; a coluna organization_users já
 * está desenhada para permitir múltiplas no futuro.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_users")
    .select("organization_id, role, organizations(*)")
    .eq("user_id", user.id)
    .eq("status", "ativo")
    .limit(1)
    .maybeSingle();

  const { data: platformAdmin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "ativo")
    .maybeSingle();

  if (!membership || !membership.organizations) {
    return {
      userId: user.id,
      email: user.email ?? null,
      organizationId: "",
      organization: null as unknown as Database["public"]["Tables"]["organizations"]["Row"],
      role: "viewer",
      isPlatformAdmin: Boolean(platformAdmin),
    };
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    organizationId: membership.organization_id,
    organization: membership.organizations as Database["public"]["Tables"]["organizations"]["Row"],
    role: membership.role,
    isPlatformAdmin: Boolean(platformAdmin),
  };
}

/** Usa em Server Components/Actions que exigem organização ativa. */
export async function requireOrgContext(): Promise<OrgContext> {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  if (!ctx.organizationId) redirect("/onboarding");
  return ctx;
}

export async function requirePlatformAdmin() {
  const ctx = await getOrgContext();
  if (!ctx || !ctx.isPlatformAdmin) redirect("/dashboard");
  return ctx;
}
