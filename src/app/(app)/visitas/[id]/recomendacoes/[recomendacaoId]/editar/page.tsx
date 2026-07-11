import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RecomendacaoForm } from "@/components/visitas/recomendacao-form";
import { updateRecomendacaoAction } from "@/lib/actions/visitas";

export default async function EditarRecomendacaoPage({
  params,
}: {
  params: Promise<{ id: string; recomendacaoId: string }>;
}) {
  const { id, recomendacaoId } = await params;
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

  const { data: recomendacao } = await supabase
    .from("recomendacoes")
    .select("*")
    .eq("id", recomendacaoId)
    .eq("visita_id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!recomendacao) notFound();

  const { data: areas } = await supabase
    .from("areas")
    .select("id, nome")
    .eq("propriedade_id", visita.propriedade_id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Editar recomendação" backHref={`/visitas/${id}`} />
      <Card>
        <CardContent>
          <RecomendacaoForm
            areas={areas ?? []}
            recomendacao={recomendacao}
            action={updateRecomendacaoAction.bind(null, recomendacaoId, id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
