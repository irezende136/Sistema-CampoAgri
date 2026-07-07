import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PropriedadeForm } from "@/components/propriedades/propriedade-form";
import { createPropriedadeAction } from "@/lib/actions/propriedades";

export default async function NovaPropriedadePage({
  searchParams,
}: {
  searchParams: Promise<{ produtor_id?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { produtor_id } = await searchParams;
  const supabase = await createClient();

  const { data: produtores } = await supabase
    .from("produtores")
    .select("id, nome")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Nova propriedade" backHref={produtor_id ? `/produtores/${produtor_id}` : "/propriedades"} />
      <Card>
        <CardContent>
          <PropriedadeForm
            produtores={produtores ?? []}
            defaultProdutorId={produtor_id}
            action={createPropriedadeAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
