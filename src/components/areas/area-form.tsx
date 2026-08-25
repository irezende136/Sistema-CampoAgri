"use client";

import { Button } from "@/components/ui/button";
import { useFormSubmit } from "@/lib/offline/use-form-submit";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import type { Database } from "@/types/database";

type Area = Database["public"]["Tables"]["areas"]["Row"];

const TIPOS = [
  ["lavoura", "Lavoura"],
  ["pastagem", "Pastagem"],
  ["piquete", "Piquete"],
  ["canavial", "Canavial"],
  ["area_silagem", "Área de silagem"],
  ["area_experimental", "Área experimental"],
  ["outro", "Outro"],
];

const STATUSES = [
  ["ativa", "Ativa"],
  ["em_reforma", "Em reforma"],
  ["em_pousio", "Em pousio"],
  ["colhida", "Colhida"],
  ["encerrada", "Encerrada"],
];

export function AreaForm({
  area,
  propriedadeId,
  aoSalvar,
}: {
  area?: Area;
  propriedadeId: string;
  aoSalvar: (dados: FormData) => Promise<void>;
}) {
  const { onSubmit, salvando, erro } = useFormSubmit(aoSalvar);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="propriedade_id" value={propriedadeId} />
      <FieldGroup label="Nome da área" htmlFor="nome">
        <Input id="nome" name="nome" required defaultValue={area?.nome} placeholder="Lavoura 1 de milho" />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Tipo" htmlFor="tipo">
          <Select id="tipo" name="tipo" required defaultValue={area?.tipo ?? ""}>
            <option value="" disabled>
              Selecione
            </option>
            {TIPOS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Área (ha)" htmlFor="area_ha">
          <Input id="area_ha" name="area_ha" type="number" step="0.01" min="0" defaultValue={area?.area_ha ?? ""} />
        </FieldGroup>
      </div>
      {area && (
        <FieldGroup label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={area.status}>
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" defaultValue={area?.observacoes ?? ""} />
      </FieldGroup>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Salvando..." : area ? "Salvar alterações" : "Cadastrar área"}
      </Button>
    </form>
  );
}
