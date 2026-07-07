"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { toDateInputValue } from "@/lib/utils/format";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Safra = Database["public"]["Tables"]["safras"]["Row"];

const FINALIDADES = [
  ["grao", "Grão"],
  ["silagem", "Silagem"],
  ["pastejo", "Pastejo"],
  ["feno", "Feno"],
  ["cobertura", "Cobertura"],
  ["cana_corte", "Cana para corte"],
  ["outro", "Outro"],
];

const SISTEMAS = [
  ["direto", "Plantio direto"],
  ["convencional", "Convencional"],
  ["minimo", "Cultivo mínimo"],
  ["reforma_pastagem", "Reforma de pastagem"],
  ["outro", "Outro"],
];

const STATUSES = [
  ["planejada", "Planejada"],
  ["plantada", "Plantada"],
  ["em_desenvolvimento", "Em desenvolvimento"],
  ["colhida", "Colhida"],
  ["encerrada", "Encerrada"],
];

export function SafraForm({
  safra,
  areaId,
  propriedadeId,
  action,
}: {
  safra?: Safra;
  areaId: string;
  propriedadeId?: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="area_id" value={areaId} />
      {propriedadeId && <input type="hidden" name="propriedade_id" value={propriedadeId} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Nome da safra/ciclo" htmlFor="nome">
          <Input id="nome" name="nome" required defaultValue={safra?.nome} placeholder="Milho Verão 2026/2027" />
        </FieldGroup>
        <FieldGroup label="Cultura" htmlFor="cultura">
          <Input id="cultura" name="cultura" required defaultValue={safra?.cultura} placeholder="Milho" />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Finalidade" htmlFor="finalidade">
          <Select id="finalidade" name="finalidade" defaultValue={safra?.finalidade ?? ""}>
            <option value="">Selecione</option>
            {FINALIDADES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Cultivar / híbrido / variedade" htmlFor="cultivar">
          <Input id="cultivar" name="cultivar" defaultValue={safra?.cultivar ?? ""} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Data prevista de plantio" htmlFor="data_prevista_plantio">
          <Input id="data_prevista_plantio" name="data_prevista_plantio" type="date" defaultValue={toDateInputValue(safra?.data_prevista_plantio)} />
        </FieldGroup>
        <FieldGroup label="Data real de plantio" htmlFor="data_real_plantio">
          <Input id="data_real_plantio" name="data_real_plantio" type="date" defaultValue={toDateInputValue(safra?.data_real_plantio)} />
        </FieldGroup>
        <FieldGroup label="Data prevista de colheita" htmlFor="data_prevista_colheita">
          <Input id="data_prevista_colheita" name="data_prevista_colheita" type="date" defaultValue={toDateInputValue(safra?.data_prevista_colheita)} />
        </FieldGroup>
        <FieldGroup label="Data real de colheita" htmlFor="data_real_colheita">
          <Input id="data_real_colheita" name="data_real_colheita" type="date" defaultValue={toDateInputValue(safra?.data_real_colheita)} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="População planejada (sementes/ha)" htmlFor="populacao_planejada">
          <Input id="populacao_planejada" name="populacao_planejada" type="number" step="1" defaultValue={safra?.populacao_planejada ?? ""} />
        </FieldGroup>
        <FieldGroup label="Espaçamento (m)" htmlFor="espacamento">
          <Input id="espacamento" name="espacamento" type="number" step="0.01" defaultValue={safra?.espacamento ?? ""} />
        </FieldGroup>
        <FieldGroup label="Profundidade de plantio (cm)" htmlFor="profundidade_plantio">
          <Input id="profundidade_plantio" name="profundidade_plantio" type="number" step="0.1" defaultValue={safra?.profundidade_plantio ?? ""} />
        </FieldGroup>
        <FieldGroup label="Sistema de plantio" htmlFor="sistema_plantio">
          <Select id="sistema_plantio" name="sistema_plantio" defaultValue={safra?.sistema_plantio ?? ""}>
            <option value="">Selecione</option>
            {SISTEMAS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      {safra && (
        <FieldGroup label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={safra.status}>
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}

      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" defaultValue={safra?.observacoes ?? ""} />
      </FieldGroup>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : safra ? "Salvar alterações" : "Cadastrar safra"}
      </Button>
    </form>
  );
}
