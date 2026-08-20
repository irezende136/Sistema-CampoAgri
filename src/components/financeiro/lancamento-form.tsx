"use client";

import { useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";

const FORMAS_PAGAMENTO = [
  ["pix", "Pix"],
  ["dinheiro", "Dinheiro"],
  ["boleto", "Boleto"],
  ["cartao", "Cartão"],
  ["transferencia", "Transferência"],
  ["outro", "Outro"],
];

export function LancamentoForm({
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
      <FieldGroup label="Descrição do serviço / cobrança" htmlFor="descricao">
        <Input
          id="descricao"
          name="descricao"
          required
          placeholder="Ex: Visita técnica, análise de solo, deslocamento"
        />
      </FieldGroup>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FieldGroup label="Valor (R$)" htmlFor="valor">
          <Input id="valor" name="valor" type="number" step="0.01" min="0" required />
        </FieldGroup>
        <FieldGroup label="Desconto" htmlFor="desconto_valor" hint="Opcional">
          <Input id="desconto_valor" name="desconto_valor" type="number" step="0.01" min="0" />
        </FieldGroup>
        <FieldGroup label="Tipo de desconto" htmlFor="desconto_tipo">
          <Select id="desconto_tipo" name="desconto_tipo" defaultValue="valor">
            <option value="valor">Valor fixo (R$)</option>
            <option value="percentual">Percentual (%)</option>
          </Select>
        </FieldGroup>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Forma de pagamento prevista" htmlFor="forma_pagamento">
          <Select id="forma_pagamento" name="forma_pagamento" defaultValue="">
            <option value="">Não definida</option>
            {FORMAS_PAGAMENTO.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Observações" htmlFor="observacoes">
          <Textarea id="observacoes" name="observacoes" className="min-h-11 h-11" />
        </FieldGroup>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Lançando..." : "Adicionar cobrança"}
      </Button>
    </form>
  );
}
