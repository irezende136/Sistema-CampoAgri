"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Produtor = Database["public"]["Tables"]["produtores"]["Row"];

export function ProdutorForm({
  produtor,
  action,
}: {
  produtor?: Produtor;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Nome do produtor" htmlFor="nome">
        <Input id="nome" name="nome" required defaultValue={produtor?.nome} placeholder="João Pereira" />
      </FieldGroup>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="CPF/CNPJ" htmlFor="cpf_cnpj">
          <Input id="cpf_cnpj" name="cpf_cnpj" defaultValue={produtor?.cpf_cnpj ?? ""} />
        </FieldGroup>
        <FieldGroup label="Telefone" htmlFor="telefone">
          <Input id="telefone" name="telefone" defaultValue={produtor?.telefone ?? ""} />
        </FieldGroup>
        <FieldGroup label="WhatsApp" htmlFor="whatsapp">
          <Input id="whatsapp" name="whatsapp" defaultValue={produtor?.whatsapp ?? ""} />
        </FieldGroup>
        <FieldGroup label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={produtor?.email ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Endereço" htmlFor="endereco">
        <Input id="endereco" name="endereco" defaultValue={produtor?.endereco ?? ""} />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Cidade" htmlFor="cidade">
          <Input id="cidade" name="cidade" defaultValue={produtor?.cidade ?? ""} />
        </FieldGroup>
        <FieldGroup label="Estado" htmlFor="estado">
          <Input id="estado" name="estado" maxLength={2} defaultValue={produtor?.estado ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" defaultValue={produtor?.observacoes ?? ""} />
      </FieldGroup>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : produtor ? "Salvar alterações" : "Cadastrar produtor"}
      </Button>
    </form>
  );
}
