"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-semibold text-lg">Esqueci minha senha</h2>
          <p className="text-sm text-muted-foreground">
            Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <FieldGroup label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />
          </FieldGroup>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-primary font-medium">
            Voltar para o login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
