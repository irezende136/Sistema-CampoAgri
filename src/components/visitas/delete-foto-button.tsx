"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteFotoAction } from "@/lib/actions/fotos";

export function DeleteFotoButton({ id, visitaId }: { id: string; visitaId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteFotoAction(id, visitaId))}
      className="h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center"
      aria-label="Remover foto"
    >
      <X size={14} />
    </button>
  );
}
