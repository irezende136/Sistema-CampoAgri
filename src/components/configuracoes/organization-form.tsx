"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

const CORES_PRESET = [
  ["#1f4d3a", "Verde campo"],
  ["#2f6a4f", "Verde folha"],
  ["#5c6b2f", "Verde oliva"],
  ["#8a5a1f", "Terracota"],
  ["#a86c1c", "Âmbar"],
  ["#2f4a6a", "Azul noite"],
  ["#4a4a4a", "Grafite"],
  ["#6a2f3d", "Bordô"],
];

export function OrganizationForm({
  organization,
  action,
}: {
  organization: Organization;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [cor, setCor] = useState(organization.cor_primaria || "#1f4d3a");

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

      <div>
        <p className="block text-sm font-medium mb-1.5">Cor do sistema</p>
        <p className="text-xs text-muted-foreground mb-2">
          Usada nos botões, menu e destaques do app, e também no cabeçalho do relatório PDF.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="cor_primaria"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            className="h-11 w-14 rounded-lg border border-border bg-card cursor-pointer p-1"
            aria-label="Escolher cor personalizada"
          />
          <Input
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            maxLength={7}
            className="w-28 font-mono uppercase"
            aria-label="Código hexadecimal da cor"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CORES_PRESET.map(([hex, label]) => (
            <button
              key={hex}
              type="button"
              title={label}
              onClick={() => setCor(hex)}
              className="h-8 w-8 rounded-full border-2"
              style={{
                backgroundColor: hex,
                borderColor: cor.toLowerCase() === hex ? "var(--foreground)" : "transparent",
              }}
              aria-label={label}
            />
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
