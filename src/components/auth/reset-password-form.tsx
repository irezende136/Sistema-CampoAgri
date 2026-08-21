"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, undefined);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-semibold text-lg">Criar nova senha</h2>
          <p className="text-sm text-muted-foreground">
            Escolha uma nova senha para acessar sua conta.
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <FieldGroup label="Nova senha" htmlFor="password" hint="Mínimo de 8 caracteres">
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </FieldGroup>
          <FieldGroup label="Confirmar nova senha" htmlFor="password_confirm">
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </FieldGroup>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
