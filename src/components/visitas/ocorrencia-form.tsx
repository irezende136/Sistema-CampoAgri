"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { TIPOS_OCORRENCIA } from "@/lib/domain/ocorrencia-tipos";
import type { ActionState } from "@/lib/actions/auth";

const SEVERIDADES = [
  ["baixa", "Baixa"],
  ["media", "Média"],
  ["alta", "Alta"],
  ["critica", "Crítica"],
];

export function OcorrenciaForm({
  areas,
  action,
}: {
  areas: { id: string; nome: string }[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Área" htmlFor="area_id">
        <Select id="area_id" name="area_id" required defaultValue="">
          <option value="" disabled>
            Selecione a área
          </option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Tipo de ocorrência" htmlFor="tipo" hint="Escolha uma sugestão ou digite livremente">
        <Input id="tipo" name="tipo" list="tipos-ocorrencia" required placeholder="Ex: Ataque de lagarta" />
        <datalist id="tipos-ocorrencia">
          {TIPOS_OCORRENCIA.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </FieldGroup>

      <FieldGroup label="Severidade" htmlFor="severidade">
        <Select id="severidade" name="severidade" defaultValue="baixa">
          {SEVERIDADES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Descrição" htmlFor="descricao">
        <Textarea id="descricao" name="descricao" />
      </FieldGroup>

      <FieldGroup label="Recomendação técnica" htmlFor="recomendacao_tecnica">
        <Textarea id="recomendacao_tecnica" name="recomendacao_tecnica" />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Produto recomendado" htmlFor="produto_recomendado">
          <Input id="produto_recomendado" name="produto_recomendado" />
        </FieldGroup>
        <FieldGroup label="Dose" htmlFor="dose">
          <Input id="dose" name="dose" />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Prazo recomendado" htmlFor="prazo_recomendado">
          <Input id="prazo_recomendado" name="prazo_recomendado" type="date" />
        </FieldGroup>
        <FieldGroup label="Responsável pela ação" htmlFor="responsavel_acao">
          <Input id="responsavel_acao" name="responsavel_acao" />
        </FieldGroup>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Registrar ocorrência"}
      </Button>
    </form>
  );
}
