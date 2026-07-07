import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Produtor = Database["public"]["Tables"]["produtores"]["Row"];
type Propriedade = Database["public"]["Tables"]["propriedades"]["Row"];

export async function getVisitReportData(organizationId: string, visitaId: string) {
  const supabase = await createClient();

  const { data: visita, error } = await supabase
    .from("visitas")
    .select("*, produtores(*), propriedades(*)")
    .eq("id", visitaId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !visita) return null;

  const produtor = (visita as unknown as { produtores: Produtor }).produtores;
  const propriedade = (visita as unknown as { propriedades: Propriedade }).propriedades;

  const [{ data: organization }, { data: responsavel }, { data: avaliacoes }, { data: ocorrencias }, { data: recomendacoes }, { data: fotos }] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", organizationId).single(),
      visita.responsavel_tecnico_id
        ? supabase.from("profiles").select("nome, email").eq("id", visita.responsavel_tecnico_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("avaliacoes_area")
        .select("*, areas(nome, tipo), safras(nome, cultura, cultivar)")
        .eq("visita_id", visitaId)
        .is("deleted_at", null),
      supabase
        .from("ocorrencias")
        .select("*, areas(nome)")
        .eq("visita_id", visitaId)
        .is("deleted_at", null)
        .order("created_at"),
      supabase
        .from("recomendacoes")
        .select("*, areas(nome)")
        .eq("visita_id", visitaId)
        .is("deleted_at", null)
        .order("created_at"),
      supabase
        .from("fotos")
        .select("*, areas(nome)")
        .eq("visita_id", visitaId)
        .is("deleted_at", null)
        .order("created_at"),
    ]);

  const fotosComUrl = await Promise.all(
    (fotos ?? []).map(async (f) => {
      const { data } = await supabase.storage.from("campoagri").createSignedUrl(f.storage_path, 3600);
      return { ...f, url: data?.signedUrl ?? null };
    })
  );

  let logoUrl: string | null = null;
  if (organization?.logo_url) {
    const { data } = await supabase.storage.from("campoagri").createSignedUrl(organization.logo_url, 3600);
    logoUrl = data?.signedUrl ?? null;
  }

  let assinaturaUrl: string | null = null;
  if (organization?.assinatura_url) {
    const { data } = await supabase.storage.from("campoagri").createSignedUrl(organization.assinatura_url, 3600);
    assinaturaUrl = data?.signedUrl ?? null;
  }

  return {
    organization: organization!,
    logoUrl,
    assinaturaUrl,
    produtor,
    propriedade,
    visita,
    responsavel,
    avaliacoes: avaliacoes ?? [],
    ocorrencias: ocorrencias ?? [],
    recomendacoes: recomendacoes ?? [],
    fotos: fotosComUrl,
  };
}

export type VisitReportData = NonNullable<Awaited<ReturnType<typeof getVisitReportData>>>;
