"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, undefined);

  return (
    <Card>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <FieldGroup label="Seu nome" htmlFor="nome">
            <Input id="nome" name="nome" required placeholder="Eng. Agrônomo(a)" />
          </FieldGroup>
          <FieldGroup label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" />
          </FieldGroup>
          <FieldGroup label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres">
            <Input id="password" name="password" type="password" required autoComplete="new-password" placeholder="••••••••" />
          </FieldGroup>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="termos" required className="mt-0.5 h-4 w-4 rounded border-border" />
            <span>
              Li e concordo com os{" "}
              <Link href="/termos" target="_blank" className="text-primary font-medium">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" target="_blank" className="text-primary font-medium">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary font-medium">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
