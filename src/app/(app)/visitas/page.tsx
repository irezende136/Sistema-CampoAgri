import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";

export default async function VisitasPage() {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: visitas } = await supabase
    .from("visitas")
    .select("id, data_visita, objetivo, status, produtores(nome), propriedades(nome)")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("data_visita", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader title="Visitas técnicas" actionLabel="Nova visita" actionHref="/visitas/nova" />

      {!visitas || visitas.length === 0 ? (
        <EmptyState
          title="Nenhuma visita registrada"
          description="Registre sua primeira visita técnica: selecione o produtor, a propriedade e comece a avaliar as áreas."
          actionLabel="Nova visita"
          actionHref="/visitas/nova"
        />
      ) : (
        <div className="space-y-3">
          {visitas.map((v) => (
            <Link key={v.id} href={`/visitas/${v.id}`}>
              <Card className="hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {(v as unknown as { produtores?: { nome?: string } }).produtores?.nome} —{" "}
                      {(v as unknown as { propriedades?: { nome?: string } }).propriedades?.nome}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{v.objetivo}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">{formatDateBR(v.data_visita)}</span>
                    <Badge tone={statusTone(v.status)}>{statusLabel(v.status)}</Badge>
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
