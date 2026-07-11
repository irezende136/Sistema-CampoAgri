"use client";

import { useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";

const TIPO_INSUMO_OPTIONS = [
  { value: "semente", label: "Semente" },
  { value: "fertilizante", label: "Fertilizante" },
  { value: "herbicida", label: "Herbicida" },
  { value: "inseticida", label: "Inseticida" },
  { value: "fungicida", label: "Fungicida" },
  { value: "corretivo", label: "Corretivo" },
  { value: "diesel", label: "Diesel" },
  { value: "servico", label: "Serviço" },
  { value: "mao_de_obra", label: "Mão de obra" },
  { value: "outro", label: "Outro" },
];

export function InsumoForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Tipo de insumo" htmlFor="tipo_insumo">
          <Select id="tipo_insumo" name="tipo_insumo" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {TIPO_INSUMO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Nome do insumo" htmlFor="nome_insumo">
          <Input id="nome_insumo" name="nome_insumo" required placeholder="Ex: Ureia 45%" />
        </FieldGroup>
        <FieldGroup label="Quantidade por hectare" htmlFor="quantidade_ha">
          <Input id="quantidade_ha" name="quantidade_ha" type="number" step="0.001" />
        </FieldGroup>
        <FieldGroup label="Unidade" htmlFor="unidade">
          <Input id="unidade" name="unidade" placeholder="kg, L, un" />
        </FieldGroup>
        <FieldGroup label="Preço unitário (R$)" htmlFor="preco_unitario">
          <Input id="preco_unitario" name="preco_unitario" type="number" step="0.01" />
        </FieldGroup>
      </div>
      <FieldGroup label="Observações" htmlFor="observacoes">
        <Input id="observacoes" name="observacoes" />
      </FieldGroup>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Adicionando..." : "Adicionar insumo/custo"}
      </Button>
    </form>
  );
}
