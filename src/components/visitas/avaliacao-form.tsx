"use client";

import { Button } from "@/components/ui/button";
import { useFormSubmit } from "@/lib/offline/use-form-submit";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import type { Database } from "@/types/database";

type Avaliacao = Database["public"]["Tables"]["avaliacoes_area"]["Row"];

export function AvaliacaoForm({
  avaliacao,
  aoSalvar,
}: {
  avaliacao: Avaliacao;
  aoSalvar: (dados: FormData) => Promise<void>;
}) {
  const { onSubmit, salvando, erro } = useFormSubmit(aoSalvar);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Estádio fenológico" htmlFor="estadio_fenologico">
          <Input id="estadio_fenologico" name="estadio_fenologico" defaultValue={avaliacao.estadio_fenologico ?? ""} placeholder="V4, R1..." />
        </FieldGroup>
        <FieldGroup label="Vigor" htmlFor="vigor">
          <Input id="vigor" name="vigor" defaultValue={avaliacao.vigor ?? ""} placeholder="Bom, regular, baixo..." />
        </FieldGroup>
        <FieldGroup label="Desenvolvimento geral" htmlFor="desenvolvimento_geral">
          <Input id="desenvolvimento_geral" name="desenvolvimento_geral" defaultValue={avaliacao.desenvolvimento_geral ?? ""} />
        </FieldGroup>
        <FieldGroup label="Stand de plantas observado" htmlFor="stand_plantas">
          <Input id="stand_plantas" name="stand_plantas" defaultValue={avaliacao.stand_plantas ?? ""} />
        </FieldGroup>
        <FieldGroup label="Uniformidade" htmlFor="uniformidade">
          <Input id="uniformidade" name="uniformidade" defaultValue={avaliacao.uniformidade ?? ""} />
        </FieldGroup>
        <FieldGroup label="Falhas de plantio" htmlFor="falhas_plantio">
          <Input id="falhas_plantio" name="falhas_plantio" defaultValue={avaliacao.falhas_plantio ?? ""} />
        </FieldGroup>
        <FieldGroup label="Acamamento" htmlFor="acamamento">
          <Input id="acamamento" name="acamamento" defaultValue={avaliacao.acamamento ?? ""} />
        </FieldGroup>
        <FieldGroup label="Umidade do solo" htmlFor="umidade_solo">
          <Input id="umidade_solo" name="umidade_solo" defaultValue={avaliacao.umidade_solo ?? ""} />
        </FieldGroup>
        <FieldGroup label="Compactação" htmlFor="compactacao">
          <Input id="compactacao" name="compactacao" defaultValue={avaliacao.compactacao ?? ""} />
        </FieldGroup>
        <FieldGroup label="Plantas daninhas" htmlFor="plantas_daninhas">
          <Input id="plantas_daninhas" name="plantas_daninhas" defaultValue={avaliacao.plantas_daninhas ?? ""} />
        </FieldGroup>
        <FieldGroup label="Pragas observadas" htmlFor="pragas">
          <Input id="pragas" name="pragas" defaultValue={avaliacao.pragas ?? ""} />
        </FieldGroup>
        <FieldGroup label="Doenças observadas" htmlFor="doencas">
          <Input id="doencas" name="doencas" defaultValue={avaliacao.doencas ?? ""} />
        </FieldGroup>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="necessidade_intervencao"
          defaultChecked={avaliacao.necessidade_intervencao ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Necessita intervenção imediata
      </label>

      <FieldGroup label="Observações gerais" htmlFor="observacoes_gerais">
        <Textarea id="observacoes_gerais" name="observacoes_gerais" defaultValue={avaliacao.observacoes_gerais ?? ""} />
      </FieldGroup>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Salvando..." : "Salvar avaliação"}
      </Button>
    </form>
  );
}
