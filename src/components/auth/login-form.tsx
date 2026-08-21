"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <Card>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />
          <FieldGroup label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" />
          </FieldGroup>
          <FieldGroup label="Senha" htmlFor="password">
            <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
          </FieldGroup>
          <div className="-mt-2 text-right">
            <Link href="/esqueci-senha" className="text-sm text-muted-foreground hover:text-primary">
              Esqueci minha senha
            </Link>
          </div>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-primary font-medium">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
