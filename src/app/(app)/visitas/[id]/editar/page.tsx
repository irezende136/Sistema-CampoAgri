import { notFound, redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EditVisitForm } from "@/components/visitas/edit-visit-form";
import { updateVisitaInfoAction } from "@/lib/actions/visitas";

export default async function EditarVisitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: visita } = await supabase
    .from("visitas")
    .select("*, produtores(nome), propriedades(nome)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!visita) notFound();
  if (visita.status !== "rascunho") redirect(`/visitas/${id}`);

  const produtor = (visita as unknown as { produtores: { nome: string } }).produtores;
  const propriedade = (visita as unknown as { propriedades: { nome: string } }).propriedades;

  return (
    <div>
      <PageHeader
        title="Editar visita"
        description={`${produtor?.nome} — ${propriedade?.nome}`}
        backHref={`/visitas/${id}`}
      />
      <Card>
        <CardContent>
          <EditVisitForm visita={visita} action={updateVisitaInfoAction.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
