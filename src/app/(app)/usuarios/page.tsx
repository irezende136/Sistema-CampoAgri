import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { canManageOrg } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddMemberForm } from "@/components/usuarios/add-member-form";
import { MemberRow } from "@/components/usuarios/member-row";

export default async function UsuariosPage() {
  const ctx = await requireOrgContext();
  const canManage = canManageOrg(ctx.role);
  const supabase = await createClient();

  const { data: membros } = await supabase
    .from("organization_users")
    .select("id, user_id, role, status, profiles(nome, email)")
    .eq("organization_id", ctx.organizationId)
    .order("created_at");

  return (
    <div className="space-y-6">
      <PageHeader title="Usuários e permissões" description="Gerencie quem tem acesso à sua organização." />

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <AddMemberForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Membros da organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(membros ?? []).map((m) => {
            const profile = (m as unknown as { profiles: { nome: string | null; email: string | null } }).profiles;
            return (
              <MemberRow
                key={m.id}
                id={m.id}
                nome={profile?.nome ?? null}
                email={profile?.email ?? null}
                role={m.role}
                status={m.status}
                isSelf={m.user_id === ctx.userId}
                canManage={canManage}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
