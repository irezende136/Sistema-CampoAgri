import { createClient } from "@/lib/supabase/server";

export async function getPlatformOverview() {
  const supabase = await createClient();

  const [
    { count: totalOrgs },
    { count: orgsAtivas },
    { count: orgsTrial },
    { count: orgsSuspensas },
    { count: totalUsuarios },
    { count: totalVisitas },
    { count: totalRelatorios },
  ] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("organizations").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status_assinatura", "active"),
    supabase.from("organizations").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status_assinatura", "trial"),
    supabase.from("organizations").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status_assinatura", "suspended"),
    supabase.from("organization_users").select("user_id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("visitas").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("relatorios").select("id", { count: "exact", head: true }).is("deleted_at", null),
  ]);

  return {
    totalOrgs: totalOrgs ?? 0,
    orgsAtivas: orgsAtivas ?? 0,
    orgsTrial: orgsTrial ?? 0,
    orgsSuspensas: orgsSuspensas ?? 0,
    totalUsuarios: totalUsuarios ?? 0,
    totalVisitas: totalVisitas ?? 0,
    totalRelatorios: totalRelatorios ?? 0,
  };
}

export async function listOrganizations() {
  const supabase = await createClient();
  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!organizations) return [];

  return Promise.all(
    organizations.map(async (org) => {
      const [{ count: usuarios }, { count: propriedades }, { count: visitas }] = await Promise.all([
        supabase.from("organization_users").select("id", { count: "exact", head: true }).eq("organization_id", org.id).eq("status", "ativo"),
        supabase.from("propriedades").select("id", { count: "exact", head: true }).eq("organization_id", org.id).is("deleted_at", null),
        supabase.from("visitas").select("id", { count: "exact", head: true }).eq("organization_id", org.id).is("deleted_at", null),
      ]);
      return { ...org, counts: { usuarios: usuarios ?? 0, propriedades: propriedades ?? 0, visitas: visitas ?? 0 } };
    })
  );
}

export async function getOrganizationDetail(organizationId: string) {
  const supabase = await createClient();

  const [{ data: organization }, { data: membros }, { count: produtores }, { count: propriedades }, { count: visitas }, { count: relatorios }, { count: fotos }] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", organizationId).maybeSingle(),
      supabase
        .from("organization_users")
        .select("id, role, status, profiles(nome, email)")
        .eq("organization_id", organizationId)
        .order("created_at"),
      supabase.from("produtores").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
      supabase.from("propriedades").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
      supabase.from("visitas").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
      supabase.from("relatorios").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
      supabase.from("fotos").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).is("deleted_at", null),
    ]);

  if (!organization) return null;

  return {
    organization,
    membros: membros ?? [],
    counts: {
      produtores: produtores ?? 0,
      propriedades: propriedades ?? 0,
      visitas: visitas ?? 0,
      relatorios: relatorios ?? 0,
      fotos: fotos ?? 0,
    },
  };
}
