import { Card, CardContent } from "@/components/ui/card";

export default function ConfirmePage() {
  return (
    <Card>
      <CardContent className="text-center space-y-2">
        <h2 className="font-semibold text-lg">Confirme seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta e
          continuar o cadastro da sua organização.
        </p>
      </CardContent>
    </Card>
  );
}
