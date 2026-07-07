import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AgendaForm } from "@/components/agenda/agenda-form";
import { createAgendamentoAction } from "@/lib/actions/agenda";

export default async function NovoAgendamentoPage() {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: produtores } = await supabase
    .from("produtores")
    .select("id, nome, propriedades(id, nome)")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Agendar visita" backHref="/agenda" />
      <Card>
        <CardContent>
          <AgendaForm produtores={produtores ?? []} action={createAgendamentoAction} />
        </CardContent>
      </Card>
    </div>
  );
}
