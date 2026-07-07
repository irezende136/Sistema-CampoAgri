import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { AutoSubmitForm } from "@/components/ui/auto-submit-form";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  ["", "Todos os status"],
  ["rascunho", "Rascunho"],
  ["finalizada", "Finalizada"],
  ["relatorio_gerado", "Relatório gerado"],
];

export default async function VisitasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; propriedade_id?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { status, propriedade_id } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("visitas")
    .select("id, data_visita, objetivo, status, produtores(nome), propriedades(nome)")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("data_visita", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  if (propriedade_id) query = query.eq("propriedade_id", propriedade_id);

  const [{ data: visitas }, { data: propriedades }] = await Promise.all([
    query,
    supabase
      .from("propriedades")
      .select("id, nome")
      .eq("organization_id", ctx.organizationId)
      .is("deleted_at", null)
      .order("nome"),
  ]);

  return (
    <div>
      <PageHeader title="Visitas técnicas" actionLabel="Nova visita" actionHref="/visitas/nova" />

      <AutoSubmitForm className="grid grid-cols-2 gap-3 mb-4">
        <Select name="status" defaultValue={status ?? ""}>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="propriedade_id" defaultValue={propriedade_id ?? ""}>
          <option value="">Todas as propriedades</option>
          {(propriedades ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </AutoSubmitForm>

      {!visitas || visitas.length === 0 ? (
        <EmptyState
          title="Nenhuma visita encontrada"
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
