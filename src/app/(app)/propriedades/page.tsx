import Link from "next/link";
import { MapPin } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PropriedadesPage() {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: propriedades } = await supabase
    .from("propriedades")
    .select("id, nome, municipio, estado, area_total_ha, tipo_atividade, produtores(nome)")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Propriedades" actionLabel="Nova propriedade" actionHref="/propriedades/novo" />

      {!propriedades || propriedades.length === 0 ? (
        <EmptyState
          title="Nenhuma propriedade cadastrada"
          description="Cadastre produtores e suas propriedades rurais para começar a organizar áreas e visitas."
          actionLabel="Nova propriedade"
          actionHref="/propriedades/novo"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {propriedades.map((p) => (
            <Link key={p.id} href={`/propriedades/${p.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="font-semibold">{p.nome}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(p as unknown as { produtores?: { nome?: string } }).produtores?.nome}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} /> {[p.municipio, p.estado].filter(Boolean).join(" - ")}
                    </span>
                    {p.tipo_atividade && <Badge tone="primary">{p.tipo_atividade}</Badge>}
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
