import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth/context";
import { listOrganizations } from "@/lib/data/platform";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";

export default async function SuperAdminOrganizacoesPage() {
  await requirePlatformAdmin();
  const organizations = await listOrganizations();

  return (
    <div>
      <PageHeader title="Organizações" backHref="/super-admin" />

      <div className="space-y-3">
        {organizations.map((org) => (
          <Link key={org.id} href={`/super-admin/organizacoes/${org.id}`}>
            <Card className="hover:border-primary transition-colors">
              <CardContent className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{org.nome_comercial || org.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {org.counts.usuarios} usuário(s) · {org.counts.propriedades} propriedade(s) · {org.counts.visitas} visita(s)
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone="primary">{org.plano}</Badge>
                  <Badge tone={statusTone(org.status_assinatura)}>{statusLabel(org.status_assinatura)}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
