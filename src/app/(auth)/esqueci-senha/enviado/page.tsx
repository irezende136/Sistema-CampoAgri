import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function LinkEnviadoPage() {
  return (
    <Card>
      <CardContent className="text-center space-y-3">
        <h2 className="font-semibold text-lg">Verifique seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Se existir uma conta com esse e-mail, você receberá um link para criar uma nova senha.
          O link vale por tempo limitado.
        </p>
        <p className="text-xs text-muted-foreground">
          Não recebeu? Confira a caixa de spam antes de solicitar novamente.
        </p>
        <Link href="/login" className="inline-block text-sm text-primary font-medium">
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}
