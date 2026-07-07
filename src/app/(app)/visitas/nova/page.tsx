import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createVisitaAction } from "@/lib/actions/visitas";
import { NewVisitForm } from "@/components/visitas/new-visit-form";

export default async function NovaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ produtor_id?: string; propriedade_id?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { produtor_id, propriedade_id } = await searchParams;
  const supabase = await createClient();

  if (!produtor_id) {
    const { data: produtores } = await supabase
      .from("produtores")
      .select("id, nome")
      .eq("organization_id", ctx.organizationId)
      .is("deleted_at", null)
      .order("nome");

    return (
      <div>
        <PageHeader title="Nova visita — selecione o produtor" backHref="/visitas" />
        {!produtores || produtores.length === 0 ? (
          <EmptyState
            title="Nenhum produtor cadastrado"
            description="Cadastre um produtor antes de iniciar uma visita."
            actionLabel="Novo produtor"
            actionHref="/produtores/novo"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {produtores.map((p) => (
              <Link key={p.id} href={`/visitas/nova?produtor_id=${p.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="font-medium">{p.nome}</CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { data: produtor } = await supabase
    .from("produtores")
    .select("id, nome")
    .eq("id", produtor_id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (!propriedade_id) {
    const { data: propriedades } = await supabase
      .from("propriedades")
      .select("id, nome, municipio, estado")
      .eq("produtor_id", produtor_id)
      .is("deleted_at", null)
      .order("nome");

    return (
      <div>
        <PageHeader title={`Nova visita — ${produtor?.nome}`} description="Selecione a propriedade" backHref="/visitas/nova" />
        {!propriedades || propriedades.length === 0 ? (
          <EmptyState
            title="Nenhuma propriedade cadastrada"
            description="Cadastre uma propriedade para este produtor antes de iniciar a visita."
            actionLabel="Nova propriedade"
            actionHref={`/propriedades/novo?produtor_id=${produtor_id}`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {propriedades.map((p) => (
              <Link key={p.id} href={`/visitas/nova?produtor_id=${produtor_id}&propriedade_id=${p.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {[p.municipio, p.estado].filter(Boolean).join(" - ")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { data: propriedade } = await supabase
    .from("propriedades")
    .select("id, nome")
    .eq("id", propriedade_id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  return (
    <div>
      <PageHeader
        title={`Nova visita — ${produtor?.nome}`}
        description={propriedade?.nome}
        backHref={`/visitas/nova?produtor_id=${produtor_id}`}
      />
      <Card>
        <CardContent>
          <NewVisitForm produtorId={produtor_id} propriedadeId={propriedade_id} action={createVisitaAction} />
        </CardContent>
      </Card>
    </div>
  );
}
