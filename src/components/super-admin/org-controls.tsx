"use client";

import { useTransition } from "react";
import { updateOrgStatusAction, updateOrgPlanAction } from "@/lib/actions/platform";

const STATUSES = [
  ["trial", "Trial"],
  ["active", "Ativa"],
  ["past_due", "Pagamento pendente"],
  ["canceled", "Cancelada"],
  ["suspended", "Suspensa"],
];

const PLANOS = [
  ["trial", "Trial"],
  ["individual", "Individual"],
  ["profissional", "Profissional"],
  ["equipe", "Equipe"],
];

export function OrgControls({
  organizationId,
  status,
  plano,
}: {
  organizationId: string;
  status: string;
  plano: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Status da assinatura</label>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) => startTransition(() => updateOrgStatusAction(organizationId, e.target.value))}
          className="h-10 w-full rounded-lg border border-border bg-card px-2 text-sm"
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Plano</label>
        <select
          defaultValue={plano}
          disabled={pending}
          onChange={(e) => startTransition(() => updateOrgPlanAction(organizationId, e.target.value))}
          className="h-10 w-full rounded-lg border border-border bg-card px-2 text-sm"
        >
          {PLANOS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
