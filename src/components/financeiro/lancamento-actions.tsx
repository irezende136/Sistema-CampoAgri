"use client";

import { useTransition } from "react";
import { CheckCircle2, RotateCcw, XCircle, Trash2 } from "lucide-react";
import { updateLancamentoStatusAction, deleteLancamentoAction } from "@/lib/actions/financeiro";

export function LancamentoActions({
  id,
  status,
  visitaId,
  canDelete,
}: {
  id: string;
  status: string;
  visitaId?: string | null;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {status === "pendente" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => updateLancamentoStatusAction(id, "pago", visitaId))}
            className="inline-flex items-center gap-1 text-xs font-medium text-success hover:underline px-1.5 py-1"
            aria-label="Marcar como pago"
          >
            <CheckCircle2 size={15} /> Pago
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => updateLancamentoStatusAction(id, "cancelado", visitaId))}
            className="text-muted-foreground hover:text-danger p-1"
            aria-label="Cancelar cobrança"
          >
            <XCircle size={15} />
          </button>
        </>
      )}
      {status !== "pendente" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => updateLancamentoStatusAction(id, "pendente", visitaId))}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Voltar para pendente"
        >
          <RotateCcw size={15} />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Excluir este lançamento?")) {
              startTransition(() => deleteLancamentoAction(id, visitaId));
            }
          }}
          className="text-muted-foreground hover:text-danger p-1"
          aria-label="Excluir lançamento"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
