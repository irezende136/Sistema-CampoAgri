"use client";

import { useActionState } from "react";
import Link from "next/link";
import { acceptTermsAction } from "@/lib/actions/legal";
import { Button } from "@/components/ui/button";

export function AcceptTermsForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(acceptTermsAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="termos" required className="mt-0.5 h-4 w-4 rounded border-border" />
        <span>
          Li e concordo com os{" "}
          <Link href="/termos" target="_blank" className="text-primary font-medium">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="text-primary font-medium">
            Política de Privacidade
          </Link>{" "}
          atualizados.
        </span>
      </label>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Confirmando..." : "Aceitar e continuar"}
      </Button>
    </form>
  );
}
