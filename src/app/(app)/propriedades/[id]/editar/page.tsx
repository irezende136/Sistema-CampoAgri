import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PropriedadeForm } from "@/components/propriedades/propriedade-form";
import { updatePropriedadeAction } from "@/lib/actions/propriedades";

export default async function EditarPropriedadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: propriedade } = await supabase
    .from("propriedades")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!propriedade) notFound();

  const { data: produtores } = await supabase
    .from("produtores")
    .select("id, nome")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title={`Editar ${propriedade.nome}`} backHref={`/propriedades/${id}`} />
      <Card>
        <CardContent>
          <PropriedadeForm
            propriedade={propriedade}
            produtores={produtores ?? []}
            action={updatePropriedadeAction.bind(null, id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
