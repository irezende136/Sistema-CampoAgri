"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "@/lib/actions/auth";
import { wipeOfflineDb } from "@/lib/offline/idb";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { OrgRole } from "@/lib/auth/context";
import { LogOut, ChevronDown } from "lucide-react";

export function UserMenu({ email, role }: { email: string | null; role: OrgRole }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted text-sm"
      >
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
          {(email ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <div className="font-medium leading-tight max-w-[160px] truncate">{email}</div>
          <div className="text-xs text-muted-foreground leading-tight">{ROLE_LABELS[role]}</div>
        </div>
        <ChevronDown size={16} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-1 z-50">
          <form
            action={signOut}
            onSubmit={() => {
              // Limpa as páginas salvas para leitura offline — outra pessoa
              // no mesmo aparelho não deve ver dados da conta desconectada.
              if ("caches" in window) {
                caches.keys().then((keys) => {
                  keys.filter((k) => k.startsWith("campoagri-pages") || k.startsWith("campoagri-images")).forEach((k) => caches.delete(k));
                });
              }
              // Apaga tambem a copia local dos dados (IndexedDB).
              void wipeOfflineDb();
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
            >
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
