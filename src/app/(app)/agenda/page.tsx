import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";
import { AgendaItemActions } from "@/components/agenda/agenda-item-actions";

export default async function AgendaPage() {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: agendamentos } = await supabase
    .from("agenda_visitas")
    .select("id, data_prevista, horario, objetivo, status, produtor_id, produtores(nome), propriedades(id, nome)")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("data_prevista", { ascending: true });

  return (
    <div>
      <PageHeader title="Agenda de visitas" actionLabel="Agendar visita" actionHref="/agenda/nova" />

      {!agendamentos || agendamentos.length === 0 ? (
        <EmptyState
          title="Nenhuma visita agendada"
          description="Agende a próxima visita técnica para não perder o prazo com o produtor."
          actionLabel="Agendar visita"
          actionHref="/agenda/nova"
        />
      ) : (
        <div className="space-y-3">
          {agendamentos.map((a) => {
            const produtor = (a as unknown as { produtores?: { nome?: string } }).produtores;
            const propriedade = (a as unknown as { propriedades?: { id: string; nome?: string } }).propriedades;
            return (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {produtor?.nome} — {propriedade?.nome}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{a.objetivo}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {formatDateBR(a.data_prevista)}
                      {a.horario ? ` · ${a.horario.slice(0, 5)}` : ""}
                    </span>
                    <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                    <AgendaItemActions
                      id={a.id}
                      status={a.status}
                      produtorId={a.produtor_id}
                      propriedadeId={propriedade?.id}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
