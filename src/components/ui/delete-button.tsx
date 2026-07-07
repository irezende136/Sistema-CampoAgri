"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage = "Tem certeza? Os dados serão movidos para o histórico e não aparecerão mais nas listagens.",
  label = "Excluir",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground max-w-[180px]">{confirmMessage}</span>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(action)}
        >
          Confirmar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 size={16} /> {label}
    </Button>
  );
}
