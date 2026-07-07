import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AreaForm } from "@/components/areas/area-form";
import { createAreaAction } from "@/lib/actions/areas";

export default async function NovaAreaPage({
  searchParams,
}: {
  searchParams: Promise<{ propriedade_id?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { propriedade_id } = await searchParams;
  if (!propriedade_id) notFound();

  const supabase = await createClient();
  const { data: propriedade } = await supabase
    .from("propriedades")
    .select("id, nome")
    .eq("id", propriedade_id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (!propriedade) notFound();

  return (
    <div>
      <PageHeader title={`Nova área — ${propriedade.nome}`} backHref={`/propriedades/${propriedade.id}`} />
      <Card>
        <CardContent>
          <AreaForm propriedadeId={propriedade.id} action={createAreaAction} />
        </CardContent>
      </Card>
    </div>
  );
}
