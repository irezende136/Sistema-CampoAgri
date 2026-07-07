"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";

export function NewVisitForm({
  produtorId,
  propriedadeId,
  action,
}: {
  produtorId: string;
  propriedadeId: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="produtor_id" value={produtorId} />
      <input type="hidden" name="propriedade_id" value={propriedadeId} />
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Data da visita" htmlFor="data_visita">
          <Input id="data_visita" name="data_visita" type="date" required defaultValue={today} />
        </FieldGroup>
        <FieldGroup label="Horário inicial" htmlFor="hora_inicial">
          <Input id="hora_inicial" name="hora_inicial" type="time" />
        </FieldGroup>
      </div>
      <FieldGroup label="Objetivo da visita" htmlFor="objetivo">
        <Input id="objetivo" name="objetivo" placeholder="Ex: Avaliação de desenvolvimento inicial da lavoura" />
      </FieldGroup>
      <FieldGroup label="Condições climáticas" htmlFor="condicoes_climaticas">
        <Textarea id="condicoes_climaticas" name="condicoes_climaticas" placeholder="Ensolarado, 26°C, sem chuva nos últimos 5 dias..." />
      </FieldGroup>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Iniciando..." : "Iniciar visita"}
      </Button>
    </form>
  );
}
