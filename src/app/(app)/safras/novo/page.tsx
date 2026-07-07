import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SafraForm } from "@/components/safras/safra-form";
import { createSafraAction } from "@/lib/actions/safras";

export default async function NovaSafraPage({
  searchParams,
}: {
  searchParams: Promise<{ area_id?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { area_id } = await searchParams;
  if (!area_id) notFound();

  const supabase = await createClient();
  const { data: area } = await supabase
    .from("areas")
    .select("id, nome, propriedade_id")
    .eq("id", area_id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (!area) notFound();

  return (
    <div>
      <PageHeader title={`Nova safra — ${area.nome}`} backHref={`/areas/${area.id}`} />
      <Card>
        <CardContent>
          <SafraForm areaId={area.id} propriedadeId={area.propriedade_id} action={createSafraAction} />
        </CardContent>
      </Card>
    </div>
  );
}
