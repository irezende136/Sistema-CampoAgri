import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SafraForm } from "@/components/safras/safra-form";
import { updateSafraAction } from "@/lib/actions/safras";

export default async function EditarSafraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: safra } = await supabase
    .from("safras")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!safra) notFound();

  return (
    <div>
      <PageHeader title={`Editar ${safra.nome}`} backHref={`/safras/${id}`} />
      <Card>
        <CardContent>
          <SafraForm safra={safra} areaId={safra.area_id} action={updateSafraAction.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
