import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, FileText } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { getPropertyHistory } from "@/lib/data/property-history";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";

export default async function HistoricoPropriedadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: propriedade } = await supabase
    .from("propriedades")
    .select("id, nome, produtores(nome)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (!propriedade) notFound();

  const events = await getPropertyHistory(ctx.organizationId, id);
  const produtorNome = (propriedade as unknown as { produtores: { nome: string } }).produtores?.nome;

  return (
    <div>
      <PageHeader
        title={`Histórico — ${propriedade.nome}`}
        description={`Produtor: ${produtorNome ?? ""}`}
        backHref={`/propriedades/${id}`}
      />

      {events.length === 0 ? (
        <EmptyState title="Nenhum histórico ainda" description="Visitas e relatórios gerados para esta propriedade aparecerão aqui em ordem cronológica." />
      ) : (
        <div className="relative pl-6 border-l-2 border-border space-y-4">
          {events.map((e) => (
            <div key={`${e.type}-${e.id}`} className="relative">
              <div className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-primary" />
              <Link href={e.href}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {e.type === "visita" ? <ClipboardList size={14} /> : <FileText size={14} />}
                        {formatDateBR(e.date)}
                      </div>
                      <div className="font-medium">{e.title}</div>
                      {e.description && <div className="text-sm text-muted-foreground truncate">{e.description}</div>}
                    </div>
                    {e.status && <Badge tone={statusTone(e.status)}>{statusLabel(e.status)}</Badge>}
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
