"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { useOrgCtx } from "@/components/offline/org-context";
import { criarLancamentoLocal } from "@/lib/offline/visita-actions";

const FORMAS_PAGAMENTO = [
  ["pix", "Pix"],
  ["dinheiro", "Dinheiro"],
  ["boleto", "Boleto"],
  ["cartao", "Cartão"],
  ["transferencia", "Transferência"],
  ["outro", "Outro"],
];

export function LancamentoOfflineForm({
  visitaId,
  produtorId,
  propriedadeId,
  aoSalvar,
}: {
  visitaId: string;
  produtorId: string;
  propriedadeId: string | null;
  aoSalvar: () => void;
}) {
  const ctx = useOrgCtx();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);

    const descricao = String(f.get("descricao") ?? "").trim();
    if (!descricao) return setErro("Informe a descrição do serviço/cobrança.");

    const valor = Number(f.get("valor"));
    if (!Number.isFinite(valor) || valor < 0) return setErro("Informe um valor válido.");

    const descontoRaw = f.get("desconto_valor");
    const desconto_valor = descontoRaw !== null && descontoRaw !== "" ? Number(descontoRaw) : null;
    const desconto_tipo = desconto_valor ? String(f.get("desconto_tipo") ?? "valor") : null;
    if (desconto_tipo === "percentual" && desconto_valor !== null && desconto_valor > 100) {
      return setErro("Desconto percentual não pode passar de 100%.");
    }

    setSalvando(true);
    setErro(null);
    try {
      await criarLancamentoLocal(ctx, {
        visita_id: visitaId,
        produtor_id: produtorId,
        propriedade_id: propriedadeId,
        descricao,
        valor,
        desconto_tipo,
        desconto_valor,
        forma_pagamento: String(f.get("forma_pagamento") ?? "").trim() || null,
        observacoes: String(f.get("observacoes") ?? "").trim() || null,
      });
      form.reset();
      aoSalvar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível lançar a cobrança.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      <FieldGroup label="Descrição do serviço / cobrança" htmlFor="descricao">
        <Input id="descricao" name="descricao" required placeholder="Ex: Visita técnica, análise de solo" />
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
            {FORMAS_PAGAMENTO.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Observações" htmlFor="observacoes">
          <Input id="observacoes" name="observacoes" />
        </FieldGroup>
      </div>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
        {salvando ? "Lançando..." : "Adicionar cobrança"}
      </Button>
    </form>
  );
}
