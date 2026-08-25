"use client";

import { Button } from "@/components/ui/button";
import { useFormSubmit } from "@/lib/offline/use-form-submit";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import type { Database } from "@/types/database";

type Planejamento = Database["public"]["Tables"]["planejamento_plantio"]["Row"];

export function PlanejamentoForm({
  planejamento,
  aoSalvar,
}: {
  planejamento?: Planejamento | null;
  aoSalvar: (dados: FormData) => Promise<void>;
}) {
  const { onSubmit, salvando, erro } = useFormSubmit(aoSalvar);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Cultivar / híbrido" htmlFor="cultivar">
          <Input id="cultivar" name="cultivar" defaultValue={planejamento?.cultivar ?? ""} />
        </FieldGroup>
        <FieldGroup label="Sementes por hectare" htmlFor="sementes_por_ha">
          <Input id="sementes_por_ha" name="sementes_por_ha" type="number" defaultValue={planejamento?.sementes_por_ha ?? ""} />
        </FieldGroup>
        <FieldGroup label="Espaçamento (m)" htmlFor="espacamento">
          <Input id="espacamento" name="espacamento" type="number" step="0.01" defaultValue={planejamento?.espacamento ?? ""} />
        </FieldGroup>
        <FieldGroup label="Profundidade (cm)" htmlFor="profundidade">
          <Input id="profundidade" name="profundidade" type="number" step="0.1" defaultValue={planejamento?.profundidade ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Tratamento de sementes" htmlFor="tratamento_sementes">
        <Input id="tratamento_sementes" name="tratamento_sementes" defaultValue={planejamento?.tratamento_sementes ?? ""} />
      </FieldGroup>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Adubação de base planejada" htmlFor="adubacao_base">
          <Input id="adubacao_base" name="adubacao_base" defaultValue={planejamento?.adubacao_base ?? ""} placeholder="350 kg/ha de 08-28-16" />
        </FieldGroup>
        <FieldGroup label="Adubação de cobertura planejada" htmlFor="adubacao_cobertura">
          <Input id="adubacao_cobertura" name="adubacao_cobertura" defaultValue={planejamento?.adubacao_cobertura ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Produtos previstos" htmlFor="produtos_previstos">
        <Textarea id="produtos_previstos" name="produtos_previstos" defaultValue={planejamento?.produtos_previstos ?? ""} />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Custo estimado por hectare (R$)" htmlFor="custo_estimado_ha">
          <Input id="custo_estimado_ha" name="custo_estimado_ha" type="number" step="0.01" defaultValue={planejamento?.custo_estimado_ha ?? ""} />
        </FieldGroup>
        <FieldGroup label="Custo total estimado (R$)" htmlFor="custo_total_estimado">
          <Input id="custo_total_estimado" name="custo_total_estimado" type="number" step="0.01" defaultValue={planejamento?.custo_total_estimado ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup label="Observações técnicas" htmlFor="observacoes_tecnicas">
        <Textarea id="observacoes_tecnicas" name="observacoes_tecnicas" defaultValue={planejamento?.observacoes_tecnicas ?? ""} />
      </FieldGroup>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Salvando..." : "Salvar planejamento de plantio"}
      </Button>
    </form>
  );
}
