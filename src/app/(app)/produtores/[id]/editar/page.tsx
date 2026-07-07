import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProdutorForm } from "@/components/produtores/produtor-form";
import { updateProdutorAction } from "@/lib/actions/produtores";

export default async function EditarProdutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: produtor } = await supabase
    .from("produtores")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!produtor) notFound();

  return (
    <div>
      <PageHeader title={`Editar ${produtor.nome}`} backHref={`/produtores/${id}`} />
      <Card>
        <CardContent>
          <ProdutorForm produtor={produtor} action={updateProdutorAction.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
