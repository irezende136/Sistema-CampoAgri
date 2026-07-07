import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Pencil } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canDelete } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteProdutorAction } from "@/lib/actions/produtores";

export default async function ProdutorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: propriedades } = await supabase
    .from("propriedades")
    .select("id, nome, municipio, estado, area_total_ha, tipo_atividade")
    .eq("produtor_id", id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader
        title={produtor.nome}
        backHref="/produtores"
        actionLabel="Nova propriedade"
        actionHref={`/propriedades/novo?produtor_id=${id}`}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {produtor.telefone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {produtor.telefone}
              </span>
            )}
            {produtor.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {produtor.email}
              </span>
            )}
            {(produtor.cidade || produtor.estado) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {[produtor.cidade, produtor.estado].filter(Boolean).join(" - ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href={`/produtores/${id}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && (
              <DeleteButton action={deleteProdutorAction.bind(null, id)} label="Excluir produtor" />
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Propriedades</h2>
      {!propriedades || propriedades.length === 0 ? (
        <EmptyState
          title="Nenhuma propriedade cadastrada"
          description="Cadastre a propriedade rural deste produtor para começar a organizar áreas e visitas."
          actionLabel="Nova propriedade"
          actionHref={`/propriedades/novo?produtor_id=${id}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {propriedades.map((p) => (
            <Link key={p.id} href={`/propriedades/${p.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="font-semibold">{p.nome}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {[p.municipio, p.estado].filter(Boolean).join(" - ")}
                  </div>
                  {p.area_total_ha && (
                    <div className="text-sm text-muted-foreground">{p.area_total_ha} ha</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
