import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { AcceptTermsForm } from "@/components/legal/accept-terms-form";
import { TERMS_UPDATED_AT } from "@/lib/legal/constants";

export default async function AceitarTermosPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { redirect: redirectTo } = await searchParams;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Atualizamos nossos termos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Antes de continuar, confirme que leu e concorda com os Termos de Uso e a Política
            de Privacidade (versão de {TERMS_UPDATED_AT}), em conformidade com a LGPD e o
            Código de Defesa do Consumidor.
          </p>
        </div>
        <AcceptTermsForm redirectTo={redirectTo ?? "/dashboard"} />
      </CardContent>
    </Card>
  );
}
