"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Visita = Database["public"]["Tables"]["visitas"]["Row"];

export function ResumoForm({
  visita,
  action,
  readOnly,
}: {
  visita: Visita;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Horário final" htmlFor="hora_final">
        <Input id="hora_final" name="hora_final" type="time" defaultValue={visita.hora_final ?? ""} disabled={readOnly} />
      </FieldGroup>
      <FieldGroup label="Resumo geral da visita" htmlFor="resumo_geral">
        <Textarea id="resumo_geral" name="resumo_geral" defaultValue={visita.resumo_geral ?? ""} disabled={readOnly} rows={4} />
      </FieldGroup>
      <FieldGroup label="Próximas ações" htmlFor="proximas_acoes">
        <Textarea id="proximas_acoes" name="proximas_acoes" defaultValue={visita.proximas_acoes ?? ""} disabled={readOnly} />
      </FieldGroup>
      <FieldGroup label="Observações finais" htmlFor="observacoes_finais">
        <Textarea id="observacoes_finais" name="observacoes_finais" defaultValue={visita.observacoes_finais ?? ""} disabled={readOnly} />
      </FieldGroup>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {!readOnly && (
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar resumo"}
        </Button>
      )}
    </form>
  );
}
