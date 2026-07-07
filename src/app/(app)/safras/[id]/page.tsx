import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canDelete } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { deleteSafraAction, upsertPlanejamentoAction } from "@/lib/actions/safras";
import { PlanejamentoForm } from "@/components/safras/planejamento-form";
import { formatDateBR } from "@/lib/utils/format";

export default async function SafraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: safra } = await supabase
    .from("safras")
    .select("*, areas(id, nome, propriedade_id)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!safra) notFound();
  const area = (safra as unknown as { areas: { id: string; nome: string; propriedade_id: string } }).areas;

  const { data: planejamento } = await supabase
    .from("planejamento_plantio")
    .select("*")
    .eq("safra_id", id)
    .is("deleted_at", null)
    .maybeSingle();

  return (
    <div>
      <PageHeader title={safra.nome} description={`Área: ${area?.nome ?? ""}`} backHref={`/areas/${area?.id}`} />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>{safra.cultura}</span>
            {safra.cultivar && <span>{safra.cultivar}</span>}
            {safra.data_prevista_plantio && <span>Plantio: {formatDateBR(safra.data_prevista_plantio)}</span>}
            <Badge tone={statusTone(safra.status)}>{statusLabel(safra.status)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href={`/safras/${id}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && area && (
              <DeleteButton action={deleteSafraAction.bind(null, id, area.id)} label="Excluir safra" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planejamento de plantio</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanejamentoForm
            planejamento={planejamento}
            action={upsertPlanejamentoAction.bind(null, id, safra.area_id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
