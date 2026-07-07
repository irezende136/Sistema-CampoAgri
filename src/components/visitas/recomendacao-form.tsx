"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";

const CATEGORIAS = [
  ["plantio", "Plantio"],
  ["adubacao", "Adubação"],
  ["pragas", "Pragas"],
  ["doencas", "Doenças"],
  ["plantas_daninhas", "Plantas daninhas"],
  ["solo", "Solo"],
  ["pastagem", "Pastagem"],
  ["colheita", "Colheita"],
  ["manejo_geral", "Manejo geral"],
];

const PRIORIDADES = [
  ["baixa", "Baixa"],
  ["media", "Média"],
  ["alta", "Alta"],
  ["urgente", "Urgente"],
];

export function RecomendacaoForm({
  areas,
  action,
}: {
  areas: { id: string; nome: string }[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Área (opcional)" htmlFor="area_id">
        <Select id="area_id" name="area_id" defaultValue="">
          <option value="">Recomendação geral da propriedade</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Categoria" htmlFor="categoria">
          <Select id="categoria" name="categoria" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {CATEGORIAS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Prioridade" htmlFor="prioridade">
          <Select id="prioridade" name="prioridade" defaultValue="media">
            {PRIORIDADES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Recomendação" htmlFor="recomendacao">
        <Textarea id="recomendacao" name="recomendacao" required rows={4} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Produto sugerido" htmlFor="produto_sugerido">
          <Input id="produto_sugerido" name="produto_sugerido" />
        </FieldGroup>
        <FieldGroup label="Dose" htmlFor="dose">
          <Input id="dose" name="dose" />
        </FieldGroup>
        <FieldGroup label="Volume de calda" htmlFor="volume_calda">
          <Input id="volume_calda" name="volume_calda" />
        </FieldGroup>
        <FieldGroup label="Área a aplicar" htmlFor="area_aplicar">
          <Input id="area_aplicar" name="area_aplicar" />
        </FieldGroup>
      </div>

      <FieldGroup label="Prazo sugerido" htmlFor="prazo_sugerido">
        <Input id="prazo_sugerido" name="prazo_sugerido" type="date" />
      </FieldGroup>

      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" />
      </FieldGroup>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Registrar recomendação"}
      </Button>
    </form>
  );
}
