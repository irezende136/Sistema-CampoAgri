import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth/context";
import { getOrganizationDetail } from "@/lib/data/platform";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users2, Sprout, MapPin, ClipboardList, FileText, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { OrgControls } from "@/components/super-admin/org-controls";

export default async function SuperAdminOrganizacaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePlatformAdmin();
  const detail = await getOrganizationDetail(id);
  if (!detail) notFound();

  const { organization, membros, counts } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={organization.nome_comercial || organization.nome}
        description={[organization.cidade, organization.estado].filter(Boolean).join(" - ")}
        backHref="/super-admin/organizacoes"
      />

      <Card>
        <CardHeader>
          <CardTitle>Plano e status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrgControls organizationId={organization.id} status={organization.status_assinatura} plano={organization.plano} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Usuários" value={membros.length} icon={Users2} />
        <StatCard label="Produtores" value={counts.produtores} icon={Sprout} />
        <StatCard label="Propriedades" value={counts.propriedades} icon={MapPin} />
        <StatCard label="Visitas" value={counts.visitas} icon={ClipboardList} />
        <StatCard label="Relatórios" value={counts.relatorios} icon={FileText} />
        <StatCard label="Fotos" value={counts.fotos} icon={Camera} tone="accent" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários da organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {membros.map((m) => {
            const profile = (m as unknown as { profiles: { nome: string | null; email: string | null } }).profiles;
            return (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">{profile?.nome || profile?.email}</div>
                  <div className="text-xs text-muted-foreground">{profile?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="primary">{ROLE_LABELS[m.role]}</Badge>
                  <Badge tone={m.status === "ativo" ? "success" : "neutral"}>{m.status}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
