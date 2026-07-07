"use client";

import { useActionState } from "react";
import { createOrganizationAction } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createOrganizationAction, undefined);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Vamos configurar sua organização</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pode ser seu nome como agrônomo autônomo ou o nome do seu escritório de consultoria.
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <FieldGroup label="Nome da organização" htmlFor="nome">
            <Input id="nome" name="nome" required placeholder="Ex: AgroGestão Técnica" />
          </FieldGroup>
          <FieldGroup label="E-mail de contato" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="contato@exemplo.com" />
          </FieldGroup>
          <FieldGroup label="Telefone" htmlFor="telefone">
            <Input id="telefone" name="telefone" placeholder="(32) 99999-9999" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Cidade" htmlFor="cidade">
              <Input id="cidade" name="cidade" placeholder="Juiz de Fora" />
            </FieldGroup>
            <FieldGroup label="Estado" htmlFor="estado">
              <Input id="estado" name="estado" maxLength={2} placeholder="MG" />
            </FieldGroup>
          </div>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Criando..." : "Começar a usar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
