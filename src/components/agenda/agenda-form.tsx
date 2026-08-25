"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormSubmit } from "@/lib/offline/use-form-submit";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";

type Produtor = { id: string; nome: string; propriedades: { id: string; nome: string }[] };

export function AgendaForm({
  produtores,
  aoSalvar,
}: {
  produtores: Produtor[];
  aoSalvar: (dados: FormData) => Promise<void>;
}) {
  const { onSubmit, salvando, erro } = useFormSubmit(aoSalvar);
  const [produtorId, setProdutorId] = useState("");

  const propriedades = useMemo(
    () => produtores.find((p) => p.id === produtorId)?.propriedades ?? [],
    [produtorId, produtores]
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FieldGroup label="Produtor" htmlFor="produtor_id">
        <Select id="produtor_id" name="produtor_id" required value={produtorId} onChange={(e) => setProdutorId(e.target.value)}>
          <option value="" disabled>
            Selecione o produtor
          </option>
          {produtores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Propriedade" htmlFor="propriedade_id">
        <Select id="propriedade_id" name="propriedade_id" required disabled={!produtorId} defaultValue="">
          <option value="" disabled>
            {produtorId ? "Selecione a propriedade" : "Selecione o produtor primeiro"}
          </option>
          {propriedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Data prevista" htmlFor="data_prevista">
          <Input id="data_prevista" name="data_prevista" type="date" required />
        </FieldGroup>
        <FieldGroup label="Horário" htmlFor="horario">
          <Input id="horario" name="horario" type="time" />
        </FieldGroup>
      </div>

      <FieldGroup label="Objetivo" htmlFor="objetivo">
        <Input id="objetivo" name="objetivo" />
      </FieldGroup>

      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" />
      </FieldGroup>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Salvando..." : "Agendar visita"}
      </Button>
    </form>
  );
}
