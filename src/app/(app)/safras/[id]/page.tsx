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
import { createInsumoAction, deleteInsumoAction } from "@/lib/actions/insumos";
import { PlanejamentoForm } from "@/components/safras/planejamento-form";
import { InsumoForm } from "@/components/safras/insumo-form";
import { formatDateBR, formatCurrencyBRL } from "@/lib/utils/format";

const TIPO_INSUMO_LABELS: Record<string, string> = {
  semente: "Semente",
  fertilizante: "Fertilizante",
  herbicida: "Herbicida",
  inseticida: "Inseticida",
  fungicida: "Fungicida",
  corretivo: "Corretivo",
  diesel: "Diesel",
  servico: "Serviço",
  mao_de_obra: "Mão de obra",
  outro: "Outro",
};

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

  const { data: insumos } = await supabase
    .from("insumos_custos")
    .select("*")
    .eq("safra_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const custoTotalSafra = (insumos ?? []).reduce((sum, i) => sum + (i.custo_total ?? 0), 0);

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

      <Card className="mt-5">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Insumos e custos</CardTitle>
          {insumos && insumos.length > 0 && (
            <span className="text-sm font-semibold">Total: {formatCurrencyBRL(custoTotalSafra)}</span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!insumos || insumos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum insumo ou custo registrado para esta safra.</p>
          ) : (
            <div className="space-y-2">
              {insumos.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {i.nome_insumo}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({TIPO_INSUMO_LABELS[i.tipo_insumo] ?? i.tipo_insumo})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {i.quantidade_ha ? `${i.quantidade_ha} ${i.unidade ?? ""}/ha` : null}
                      {i.preco_unitario ? ` · ${formatCurrencyBRL(i.preco_unitario)}/${i.unidade ?? "un"}` : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrencyBRL(i.custo_total)}</span>
                    {canDelete(ctx.role) && (
                      <DeleteButton
                        action={deleteInsumoAction.bind(null, i.id, id)}
                        label="Excluir"
                        confirmMessage="Remover este insumo/custo?"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <InsumoForm action={createInsumoAction.bind(null, id, safra.area_id, safra.propriedade_id)} />
        </CardContent>
      </Card>
    </div>
  );
}
