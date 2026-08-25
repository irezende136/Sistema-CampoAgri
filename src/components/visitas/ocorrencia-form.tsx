"use client";

import { Button } from "@/components/ui/button";
import { useFormSubmit } from "@/lib/offline/use-form-submit";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { TIPOS_OCORRENCIA } from "@/lib/domain/ocorrencia-tipos";
import type { Database } from "@/types/database";
import { toDateInputValue } from "@/lib/utils/format";

type Ocorrencia = Database["public"]["Tables"]["ocorrencias"]["Row"];

const SEVERIDADES = [
  ["baixa", "Baixa"],
  ["media", "Média"],
  ["alta", "Alta"],
  ["critica", "Crítica"],
];

export function OcorrenciaForm({
  areas,
  aoSalvar,
  ocorrencia,
}: {
  areas: { id: string; nome: string }[];
  aoSalvar: (dados: FormData) => Promise<void>;
  ocorrencia?: Ocorrencia | null;
}) {
  const { onSubmit, salvando, erro } = useFormSubmit(aoSalvar);
  const isEdit = Boolean(ocorrencia);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FieldGroup label="Área" htmlFor="area_id">
        <Select id="area_id" name="area_id" required defaultValue={ocorrencia?.area_id ?? ""}>
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
        <Input
          id="tipo"
          name="tipo"
          list="tipos-ocorrencia"
          required
          placeholder="Ex: Ataque de lagarta"
          defaultValue={ocorrencia?.tipo ?? ""}
        />
        <datalist id="tipos-ocorrencia">
          {TIPOS_OCORRENCIA.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </FieldGroup>

      <FieldGroup label="Severidade" htmlFor="severidade">
        <Select id="severidade" name="severidade" defaultValue={ocorrencia?.severidade ?? "baixa"}>
          {SEVERIDADES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Descrição" htmlFor="descricao">
        <Textarea id="descricao" name="descricao" defaultValue={ocorrencia?.descricao ?? ""} />
      </FieldGroup>

      <FieldGroup label="Recomendação técnica" htmlFor="recomendacao_tecnica">
        <Textarea
          id="recomendacao_tecnica"
          name="recomendacao_tecnica"
          defaultValue={ocorrencia?.recomendacao_tecnica ?? ""}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Produto recomendado" htmlFor="produto_recomendado">
          <Input id="produto_recomendado" name="produto_recomendado" defaultValue={ocorrencia?.produto_recomendado ?? ""} />
        </FieldGroup>
        <FieldGroup label="Dose" htmlFor="dose">
          <Input id="dose" name="dose" defaultValue={ocorrencia?.dose ?? ""} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Prazo recomendado" htmlFor="prazo_recomendado">
          <Input
            id="prazo_recomendado"
            name="prazo_recomendado"
            type="date"
            defaultValue={toDateInputValue(ocorrencia?.prazo_recomendado)}
          />
        </FieldGroup>
        <FieldGroup label="Responsável pela ação" htmlFor="responsavel_acao">
          <Input id="responsavel_acao" name="responsavel_acao" defaultValue={ocorrencia?.responsavel_acao ?? ""} />
        </FieldGroup>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Salvando..." : isEdit ? "Salvar alterações" : "Registrar ocorrência"}
      </Button>
    </form>
  );
}
