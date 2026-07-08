"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { toDateInputValue } from "@/lib/utils/format";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Visita = Database["public"]["Tables"]["visitas"]["Row"];

export function EditVisitForm({
  visita,
  action,
}: {
  visita: Visita;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Data da visita" htmlFor="data_visita">
          <Input id="data_visita" name="data_visita" type="date" required defaultValue={toDateInputValue(visita.data_visita)} />
        </FieldGroup>
        <FieldGroup label="Horário inicial" htmlFor="hora_inicial">
          <Input id="hora_inicial" name="hora_inicial" type="time" defaultValue={visita.hora_inicial?.slice(0, 5) ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Objetivo da visita" htmlFor="objetivo">
        <Input id="objetivo" name="objetivo" defaultValue={visita.objetivo ?? ""} placeholder="Ex: Avaliação de desenvolvimento inicial da lavoura" />
      </FieldGroup>
      <FieldGroup label="Condições climáticas" htmlFor="condicoes_climaticas">
        <Textarea
          id="condicoes_climaticas"
          name="condicoes_climaticas"
          defaultValue={visita.condicoes_climaticas ?? ""}
          placeholder="Ensolarado, 26°C, sem chuva nos últimos 5 dias..."
        />
      </FieldGroup>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
