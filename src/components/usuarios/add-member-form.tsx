"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { addTeamMemberAction } from "@/lib/actions/team";
import { ROLE_LABELS } from "@/lib/auth/permissions";

const ROLES: Array<keyof typeof ROLE_LABELS> = ["admin", "agronomo", "tecnico", "assistente", "viewer"];

export function AddMemberForm() {
  const [state, formAction, pending] = useActionState(addTeamMemberAction, undefined);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3 sm:items-end">
      <div className="flex-1">
        <FieldGroup label="E-mail do usuário" htmlFor="email" hint="A pessoa precisa já ter uma conta criada em /cadastro">
          <Input id="email" name="email" type="email" required placeholder="colega@exemplo.com" />
        </FieldGroup>
      </div>
      <div className="w-full sm:w-48">
        <FieldGroup label="Papel" htmlFor="role">
          <Select id="role" name="role" defaultValue="agronomo">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>
      <Button type="submit" disabled={pending} className="sm:mb-0">
        {pending ? "Adicionando..." : "Adicionar"}
      </Button>
      {state?.error && <p className="text-sm text-danger sm:basis-full">{state.error}</p>}
    </form>
  );
}
