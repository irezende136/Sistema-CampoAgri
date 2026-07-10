import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrgContext();

  let logoUrl: string | null = null;
  if (ctx.organization?.logo_url) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("campoagri").createSignedUrl(ctx.organization.logo_url, 3600);
    logoUrl = data?.signedUrl ?? null;
  }

  return (
    <AppShell ctx={ctx} logoUrl={logoUrl}>
      {children}
    </AppShell>
  );
}
