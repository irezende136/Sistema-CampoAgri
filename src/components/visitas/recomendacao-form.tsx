"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";
import type { Database } from "@/types/database";
import { toDateInputValue } from "@/lib/utils/format";

type Recomendacao = Database["public"]["Tables"]["recomendacoes"]["Row"];

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
  recomendacao: recomendacaoRow,
}: {
  areas: { id: string; nome: string }[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  recomendacao?: Recomendacao | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(recomendacaoRow);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Área (opcional)" htmlFor="area_id">
        <Select id="area_id" name="area_id" defaultValue={recomendacaoRow?.area_id ?? ""}>
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
          <Select id="categoria" name="categoria" required defaultValue={recomendacaoRow?.categoria ?? ""}>
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
          <Select id="prioridade" name="prioridade" defaultValue={recomendacaoRow?.prioridade ?? "media"}>
            {PRIORIDADES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Recomendação" htmlFor="recomendacao">
        <Textarea id="recomendacao" name="recomendacao" required rows={4} defaultValue={recomendacaoRow?.recomendacao ?? ""} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Produto sugerido" htmlFor="produto_sugerido">
          <Input id="produto_sugerido" name="produto_sugerido" defaultValue={recomendacaoRow?.produto_sugerido ?? ""} />
        </FieldGroup>
        <FieldGroup label="Dose" htmlFor="dose">
          <Input id="dose" name="dose" defaultValue={recomendacaoRow?.dose ?? ""} />
        </FieldGroup>
        <FieldGroup label="Volume de calda" htmlFor="volume_calda">
          <Input id="volume_calda" name="volume_calda" defaultValue={recomendacaoRow?.volume_calda ?? ""} />
        </FieldGroup>
        <FieldGroup label="Área a aplicar" htmlFor="area_aplicar">
          <Input id="area_aplicar" name="area_aplicar" defaultValue={recomendacaoRow?.area_aplicar ?? ""} />
        </FieldGroup>
      </div>

      <FieldGroup label="Prazo sugerido" htmlFor="prazo_sugerido">
        <Input id="prazo_sugerido" name="prazo_sugerido" type="date" defaultValue={toDateInputValue(recomendacaoRow?.prazo_sugerido)} />
      </FieldGroup>

      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" defaultValue={recomendacaoRow?.observacoes ?? ""} />
      </FieldGroup>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Registrar recomendação"}
      </Button>
    </form>
  );
}
