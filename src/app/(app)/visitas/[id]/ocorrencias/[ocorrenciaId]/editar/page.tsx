import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OcorrenciaForm } from "@/components/visitas/ocorrencia-form";
import { updateOcorrenciaAction } from "@/lib/actions/visitas";

export default async function EditarOcorrenciaPage({
  params,
}: {
  params: Promise<{ id: string; ocorrenciaId: string }>;
}) {
  const { id, ocorrenciaId } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: visita } = await supabase
    .from("visitas")
    .select("id, propriedade_id, status")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (!visita) notFound();
  if (visita.status !== "rascunho") notFound();

  const { data: ocorrencia } = await supabase
    .from("ocorrencias")
    .select("*")
    .eq("id", ocorrenciaId)
    .eq("visita_id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!ocorrencia) notFound();

  const { data: areas } = await supabase
    .from("areas")
    .select("id, nome")
    .eq("propriedade_id", visita.propriedade_id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Editar ocorrência" backHref={`/visitas/${id}`} />
      <Card>
        <CardContent>
          <OcorrenciaForm
            areas={areas ?? []}
            ocorrencia={ocorrencia}
            action={updateOcorrenciaAction.bind(null, ocorrenciaId, id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
