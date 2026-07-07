import Link from "next/link";
import { Building2, Users, ClipboardList, FileText, CircleCheck, Clock, Ban } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth/context";
import { getPlatformOverview } from "@/lib/data/platform";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function SuperAdminPage() {
  await requirePlatformAdmin();
  const data = await getPlatformOverview();

  return (
    <div className="space-y-6">
      <PageHeader title="Painel Super Admin" description="Visão geral da plataforma Sistema CampoAgri" />

      <div className="flex gap-3 text-sm">
        <Link href="/super-admin/organizacoes" className="text-primary font-medium hover:underline">
          Organizações
        </Link>
        <Link href="/super-admin/logs" className="text-primary font-medium hover:underline">
          Logs e auditoria
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Organizações" value={data.totalOrgs} icon={Building2} />
        <StatCard label="Ativas" value={data.orgsAtivas} icon={CircleCheck} tone="accent" />
        <StatCard label="Em trial" value={data.orgsTrial} icon={Clock} tone="info" />
        <StatCard label="Suspensas" value={data.orgsSuspensas} icon={Ban} tone="danger" />
        <StatCard label="Usuários ativos" value={data.totalUsuarios} icon={Users} />
        <StatCard label="Visitas registradas" value={data.totalVisitas} icon={ClipboardList} />
        <StatCard label="Relatórios gerados" value={data.totalRelatorios} icon={FileText} />
      </div>

      <Card>
        <CardContent className="text-sm text-muted-foreground">
          Este painel é restrito a administradores da plataforma (platform_admins) e não tem relação com os
          dados operacionais de nenhuma organização específica.
        </CardContent>
      </Card>
    </div>
  );
}
