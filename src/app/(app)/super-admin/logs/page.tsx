import { requirePlatformAdmin } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTimeBR } from "@/lib/utils/format";

export default async function SuperAdminLogsPage() {
  await requirePlatformAdmin();
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("logs_auditoria")
    .select("id, acao, entidade, entidade_id, data_hora, organizations(nome)")
    .order("data_hora", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader title="Logs e auditoria" backHref="/super-admin" />

      {!logs || logs.length === 0 ? (
        <EmptyState title="Nenhum log registrado ainda" />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border -my-2">
            {logs.map((log) => {
              const org = (log as unknown as { organizations: { nome: string } | null }).organizations;
              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium">{log.acao}</span>{" "}
                    <span className="text-muted-foreground">
                      · {log.entidade} · {org?.nome ?? "-"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDateTimeBR(log.data_hora)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
