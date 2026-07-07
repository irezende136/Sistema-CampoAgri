"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export function OrganizationForm({
  organization,
  action,
}: {
  organization: Organization;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Nome da organização" htmlFor="nome">
          <Input id="nome" name="nome" required defaultValue={organization.nome} />
        </FieldGroup>
        <FieldGroup label="Nome comercial" htmlFor="nome_comercial">
          <Input id="nome_comercial" name="nome_comercial" defaultValue={organization.nome_comercial ?? ""} />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={organization.email ?? ""} />
        </FieldGroup>
        <FieldGroup label="Telefone" htmlFor="telefone">
          <Input id="telefone" name="telefone" defaultValue={organization.telefone ?? ""} />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Cidade" htmlFor="cidade">
          <Input id="cidade" name="cidade" defaultValue={organization.cidade ?? ""} />
        </FieldGroup>
        <FieldGroup label="Estado" htmlFor="estado">
          <Input id="estado" name="estado" maxLength={2} defaultValue={organization.estado ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Registro profissional" htmlFor="registro_profissional" hint="Ex: CREA/CRQ, exibido no relatório PDF">
        <Input id="registro_profissional" name="registro_profissional" defaultValue={organization.registro_profissional ?? ""} />
      </FieldGroup>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
