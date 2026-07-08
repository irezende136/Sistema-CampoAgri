import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, History } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canDelete } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { deletePropriedadeAction } from "@/lib/actions/propriedades";
import { NavigateButtons } from "@/components/propriedades/navigate-buttons";

const TIPO_AREA_LABELS: Record<string, string> = {
  lavoura: "Lavoura",
  pastagem: "Pastagem",
  piquete: "Piquete",
  canavial: "Canavial",
  area_silagem: "Área de silagem",
  area_experimental: "Área experimental",
  outro: "Outro",
};

export default async function PropriedadeDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: propriedade } = await supabase
    .from("propriedades")
    .select("*, produtores(id, nome)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!propriedade) notFound();
  const produtor = (propriedade as unknown as { produtores: { id: string; nome: string } }).produtores;

  const { data: areas } = await supabase
    .from("areas")
    .select("id, nome, tipo, area_ha, status")
    .eq("propriedade_id", id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader
        title={propriedade.nome}
        description={`Produtor: ${produtor?.nome ?? ""}`}
        backHref={produtor ? `/produtores/${produtor.id}` : "/propriedades"}
        actionLabel="Nova área/talhão"
        actionHref={`/areas/novo?propriedade_id=${id}`}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>{[propriedade.municipio, propriedade.estado].filter(Boolean).join(" - ")}</span>
            {propriedade.area_total_ha && <span>{propriedade.area_total_ha} ha totais</span>}
            {propriedade.tipo_atividade && <Badge tone="primary">{propriedade.tipo_atividade}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href={`/propriedades/${id}/historico`} variant="secondary" size="sm">
              <History size={16} /> Histórico
            </LinkButton>
            <LinkButton href={`/propriedades/${id}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && produtor && (
              <DeleteButton
                action={deletePropriedadeAction.bind(null, id, produtor.id)}
                label="Excluir propriedade"
              />
            )}
          </div>
        </CardContent>
        <CardContent className="border-t border-border flex flex-wrap items-center justify-between gap-3">
          {propriedade.latitude !== null && propriedade.longitude !== null ? (
            <>
              <span className="text-sm text-muted-foreground">
                Coordenadas: {propriedade.latitude}, {propriedade.longitude}
              </span>
              <NavigateButtons latitude={propriedade.latitude} longitude={propriedade.longitude} />
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Localização não registrada.{" "}
              <Link href={`/propriedades/${id}/editar`} className="text-primary font-medium">
                Adicionar coordenadas
              </Link>{" "}
              para navegar por Waze ou Google Maps.
            </span>
          )}
        </CardContent>
      </Card>

      <h2 className="font-semibold mb-3">Áreas / Talhões / Pastagens</h2>
      {!areas || areas.length === 0 ? (
        <EmptyState
          title="Nenhuma área cadastrada"
          description="Cadastre lavouras, pastagens ou talhões desta propriedade."
          actionLabel="Nova área/talhão"
          actionHref={`/areas/novo?propriedade_id=${id}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {areas.map((a) => (
            <Link key={a.id} href={`/areas/${a.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold">{a.nome}</div>
                    <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {TIPO_AREA_LABELS[a.tipo] ?? a.tipo} {a.area_ha ? `· ${a.area_ha} ha` : ""}
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
