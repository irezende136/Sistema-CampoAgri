"use client";

import { useTransition } from "react";
import { updateTeamMemberRoleAction, updateTeamMemberStatusAction } from "@/lib/actions/team";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { OrgRole } from "@/lib/auth/context";
import { Badge } from "@/components/ui/badge";

const ROLES: OrgRole[] = ["owner", "admin", "agronomo", "tecnico", "assistente", "viewer"];

export function MemberRow({
  id,
  nome,
  email,
  role,
  status,
  isSelf,
  canManage,
}: {
  id: string;
  nome: string | null;
  email: string | null;
  role: OrgRole;
  status: string;
  isSelf: boolean;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <div className="font-medium truncate">
          {nome || email} {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{email}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canManage ? (
          <select
            value={role}
            disabled={pending}
            onChange={(e) => startTransition(() => updateTeamMemberRoleAction(id, e.target.value as OrgRole))}
            className="h-9 rounded-lg border border-border bg-card px-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        ) : (
          <Badge tone="primary">{ROLE_LABELS[role]}</Badge>
        )}
        {canManage && !isSelf && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => updateTeamMemberStatusAction(id, status === "ativo" ? "inativo" : "ativo"))
            }
            className="text-xs font-medium px-2 py-1.5 rounded-lg border border-border hover:bg-muted"
          >
            {status === "ativo" ? "Desativar" : "Reativar"}
          </button>
        )}
        {!canManage && <Badge tone={status === "ativo" ? "success" : "neutral"}>{status}</Badge>}
      </div>
    </div>
  );
}
