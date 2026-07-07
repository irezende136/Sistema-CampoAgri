import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canManageOrg } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "@/components/configuracoes/organization-form";
import { ImageUploadField } from "@/components/configuracoes/image-upload-field";
import { updateOrganizationAction } from "@/lib/actions/organization";
import { Badge } from "@/components/ui/badge";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";

export default async function ConfiguracoesPage() {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", ctx.organizationId)
    .single();

  const canEdit = canManageOrg(ctx.role);

  let logoUrl: string | null = null;
  if (organization?.logo_url) {
    const { data } = await supabase.storage.from("campoagri").createSignedUrl(organization.logo_url, 3600);
    logoUrl = data?.signedUrl ?? null;
  }
  let assinaturaUrl: string | null = null;
  if (organization?.assinatura_url) {
    const { data } = await supabase.storage.from("campoagri").createSignedUrl(organization.assinatura_url, 3600);
    assinaturaUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações da organização"
        description="Estes dados aparecem no cabeçalho e rodapé dos relatórios PDF enviados ao produtor."
      />

      <Card>
        <CardHeader>
          <CardTitle>Plano e status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Plano: <strong className="text-foreground">{organization?.plano}</strong></span>
          <Badge tone={statusTone(organization?.status_assinatura)}>{statusLabel(organization?.status_assinatura)}</Badge>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Identidade visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadField label="Logo" organizationId={ctx.organizationId} field="logo_url" currentUrl={logoUrl} />
            <ImageUploadField label="Assinatura digital" organizationId={ctx.organizationId} field="assinatura_url" currentUrl={assinaturaUrl} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados da organização</CardTitle>
        </CardHeader>
        <CardContent>
          {organization && canEdit && (
            <OrganizationForm organization={organization} action={updateOrganizationAction} />
          )}
          {organization && !canEdit && (
            <div className="space-y-1 text-sm">
              <p>{organization.nome_comercial || organization.nome}</p>
              <p className="text-muted-foreground">{[organization.cidade, organization.estado].filter(Boolean).join(" - ")}</p>
              <p className="text-xs text-muted-foreground mt-3">
                Apenas owners e administradores podem editar os dados da organização.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
