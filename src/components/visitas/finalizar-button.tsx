"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finalizarVisitaAction } from "@/lib/actions/visitas";

export function FinalizarButton({ visitaId }: { visitaId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Finalizar? Não será mais possível editar a visita.</span>
        <Button size="sm" disabled={pending} onClick={() => startTransition(() => finalizarVisitaAction(visitaId))}>
          Confirmar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => setConfirming(true)}>
      <CheckCircle2 size={18} /> Finalizar visita
    </Button>
  );
}
