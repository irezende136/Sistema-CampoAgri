import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OcorrenciaForm } from "@/components/visitas/ocorrencia-form";
import { createOcorrenciaAction } from "@/lib/actions/visitas";

export default async function NovaOcorrenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: visita } = await supabase
    .from("visitas")
    .select("id, propriedade_id")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (!visita) notFound();

  const { data: areas } = await supabase
    .from("areas")
    .select("id, nome")
    .eq("propriedade_id", visita.propriedade_id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Nova ocorrência" backHref={`/visitas/${id}`} />
      <Card>
        <CardContent>
          <OcorrenciaForm areas={areas ?? []} action={createOcorrenciaAction.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
