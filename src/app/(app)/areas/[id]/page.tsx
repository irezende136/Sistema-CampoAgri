import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { deleteAreaAction } from "@/lib/actions/areas";
import { formatDateBR } from "@/lib/utils/format";

const TIPO_AREA_LABELS: Record<string, string> = {
  lavoura: "Lavoura",
  pastagem: "Pastagem",
  piquete: "Piquete",
  canavial: "Canavial",
  area_silagem: "Área de silagem",
  area_experimental: "Área experimental",
  outro: "Outro",
};

export default async function AreaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: area } = await supabase
    .from("areas")
    .select("*, propriedades(id, nome)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!area) notFound();
  const propriedade = (area as unknown as { propriedades: { id: string; nome: string } }).propriedades;

  const { data: safras } = await supabase
    .from("safras")
    .select("id, nome, cultura, status, data_prevista_plantio")
    .eq("area_id", id)
    .is("deleted_at", null)
    .order("data_prevista_plantio", { ascending: false });

  return (
    <div>
      <PageHeader
        title={area.nome}
        description={`Propriedade: ${propriedade?.nome ?? ""}`}
        backHref={propriedade ? `/propriedades/${propriedade.id}` : "/propriedades"}
        actionLabel="Nova safra"
        actionHref={`/safras/novo?area_id=${id}`}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>{TIPO_AREA_LABELS[area.tipo] ?? area.tipo}</span>
            {area.area_ha && <span>{area.area_ha} ha</span>}
            <Badge tone={statusTone(area.status)}>{statusLabel(area.status)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href={`/areas/${id}/editar`} variant="secondary" size="sm">
              <Pencil size={16} /> Editar
            </LinkButton>
            {canDelete(ctx.role) && propriedade && (
              <DeleteButton action={deleteAreaAction.bind(null, id, propriedade.id)} label="Excluir área" />
            )}
          </div>
        </CardContent>
      </Card>

      {area.observacoes && (
        <Card className="mb-5">
          <CardContent className="text-sm text-muted-foreground">{area.observacoes}</CardContent>
        </Card>
      )}

      <h2 className="font-semibold mb-3">Safras / Ciclos produtivos</h2>
      {!safras || safras.length === 0 ? (
        <EmptyState
          title="Nenhuma safra cadastrada"
          description="Registre a safra ou ciclo produtivo atual desta área (cultura, cultivar e datas de plantio)."
          actionLabel="Nova safra"
          actionHref={`/safras/novo?area_id=${id}`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {safras.map((s) => (
            <Link key={s.id} href={`/safras/${s.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{s.nome}</div>
                      <div className="text-sm text-muted-foreground">{s.cultura}</div>
                    </div>
                    <Badge tone={statusTone(s.status)}>{statusLabel(s.status)}</Badge>
                  </div>
                  {s.data_prevista_plantio && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Plantio previsto: {formatDateBR(s.data_prevista_plantio)}
                    </div>
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
