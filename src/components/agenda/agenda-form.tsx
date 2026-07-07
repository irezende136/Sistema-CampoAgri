"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";

type Produtor = { id: string; nome: string; propriedades: { id: string; nome: string }[] };

export function AgendaForm({
  produtores,
  action,
}: {
  produtores: Produtor[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [produtorId, setProdutorId] = useState("");

  const propriedades = useMemo(
    () => produtores.find((p) => p.id === produtorId)?.propriedades ?? [],
    [produtorId, produtores]
  );

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Produtor" htmlFor="produtor_id">
        <Select id="produtor_id" name="produtor_id" required value={produtorId} onChange={(e) => setProdutorId(e.target.value)}>
          <option value="" disabled>
            Selecione o produtor
          </option>
          {produtores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Propriedade" htmlFor="propriedade_id">
        <Select id="propriedade_id" name="propriedade_id" required disabled={!produtorId} defaultValue="">
          <option value="" disabled>
            {produtorId ? "Selecione a propriedade" : "Selecione o produtor primeiro"}
          </option>
          {propriedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Data prevista" htmlFor="data_prevista">
          <Input id="data_prevista" name="data_prevista" type="date" required />
        </FieldGroup>
        <FieldGroup label="Horário" htmlFor="horario">
          <Input id="horario" name="horario" type="time" />
        </FieldGroup>
      </div>

      <FieldGroup label="Objetivo" htmlFor="objetivo">
        <Input id="objetivo" name="objetivo" />
      </FieldGroup>

      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" />
      </FieldGroup>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Agendar visita"}
      </Button>
    </form>
  );
}
