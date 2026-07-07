import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AreaForm } from "@/components/areas/area-form";
import { updateAreaAction } from "@/lib/actions/areas";

export default async function EditarAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: area } = await supabase
    .from("areas")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!area) notFound();

  return (
    <div>
      <PageHeader title={`Editar ${area.nome}`} backHref={`/areas/${id}`} />
      <Card>
        <CardContent>
          <AreaForm area={area} propriedadeId={area.propriedade_id} action={updateAreaAction.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
