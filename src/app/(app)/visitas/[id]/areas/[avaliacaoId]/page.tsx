import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AvaliacaoForm } from "@/components/visitas/avaliacao-form";
import { updateAvaliacaoAction } from "@/lib/actions/visitas";

export default async function AvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string; avaliacaoId: string }>;
}) {
  const { id, avaliacaoId } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: avaliacao } = await supabase
    .from("avaliacoes_area")
    .select("*, areas(nome)")
    .eq("id", avaliacaoId)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!avaliacao) notFound();
  const area = (avaliacao as unknown as { areas: { nome: string } }).areas;

  return (
    <div>
      <PageHeader title={`Avaliação — ${area?.nome}`} backHref={`/visitas/${id}`} />
      <Card>
        <CardContent>
          <AvaliacaoForm avaliacao={avaliacao} action={updateAvaliacaoAction.bind(null, avaliacaoId, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
