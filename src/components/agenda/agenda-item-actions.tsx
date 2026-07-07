"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, X, Trash2 } from "lucide-react";
import { updateAgendamentoStatusAction, deleteAgendamentoAction } from "@/lib/actions/agenda";

export function AgendaItemActions({
  id,
  status,
  produtorId,
  propriedadeId,
}: {
  id: string;
  status: string;
  produtorId?: string;
  propriedadeId?: string;
}) {
  const [pending, startTransition] = useTransition();

  if (status !== "agendada") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteAgendamentoAction(id))}
        className="text-muted-foreground hover:text-danger p-1"
        aria-label="Remover"
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {produtorId && propriedadeId && (
        <Link
          href={`/visitas/nova?produtor_id=${produtorId}&propriedade_id=${propriedadeId}`}
          className="text-xs text-primary font-medium px-2 py-1 hover:underline"
        >
          Iniciar visita
        </Link>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => updateAgendamentoStatusAction(id, "realizada"))}
        className="text-muted-foreground hover:text-success p-1"
        aria-label="Marcar como realizada"
      >
        <Check size={16} />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => updateAgendamentoStatusAction(id, "cancelada"))}
        className="text-muted-foreground hover:text-danger p-1"
        aria-label="Cancelar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
