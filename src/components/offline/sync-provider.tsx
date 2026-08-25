"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { syncNow, getLastSyncAt } from "@/lib/offline/sync";
import { countPending } from "@/lib/offline/outbox";
import type { Ctx } from "@/lib/offline/repo";

type SyncState = {
  ctx: Ctx;
  pendentes: number;
  sincronizando: boolean;
  ultimaSync: string | null;
  erro: string | null;
  sincronizar: () => Promise<void>;
  recarregarPendentes: () => Promise<void>;
};

const SyncContext = createContext<SyncState | null>(null);

export function useSync(): SyncState {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync precisa estar dentro de <SyncProvider>");
  return ctx;
}

const INTERVALO_MS = 60_000;

export function SyncProvider({
  organizationId,
  userId,
  children,
}: {
  organizationId: string;
  userId: string;
  children: React.ReactNode;
}) {
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const emAndamento = useRef(false);

  const recarregarPendentes = useCallback(async () => {
    try {
      setPendentes(await countPending());
    } catch {
      // IndexedDB indisponível (navegação privada, por exemplo).
    }
  }, []);

  const sincronizar = useCallback(async () => {
    if (emAndamento.current) return;
    emAndamento.current = true;
    setSincronizando(true);
    setErro(null);

    try {
      const r = await syncNow(organizationId);
      if (!r.ok && r.erro && r.erro !== "sem conexão") setErro(r.erro);
      setUltimaSync(await getLastSyncAt());
      await recarregarPendentes();
    } finally {
      emAndamento.current = false;
      setSincronizando(false);
    }
  }, [organizationId, recarregarPendentes]);

  // Sincroniza ao abrir, ao voltar a conexão, ao reabrir o app e de tempos em
  // tempos — o agrônomo pode passar horas sem sinal e voltar com pendências.
  useEffect(() => {
    void sincronizar();

    const aoVoltarConexao = () => void sincronizar();
    const aoFocar = () => {
      if (document.visibilityState === "visible") void sincronizar();
    };

    window.addEventListener("online", aoVoltarConexao);
    document.addEventListener("visibilitychange", aoFocar);
    const timer = setInterval(() => {
      if (navigator.onLine) void sincronizar();
    }, INTERVALO_MS);

    return () => {
      window.removeEventListener("online", aoVoltarConexao);
      document.removeEventListener("visibilitychange", aoFocar);
      clearInterval(timer);
    };
  }, [sincronizar]);

  return (
    <SyncContext.Provider
      value={{
        ctx: { organizationId, userId },
        pendentes,
        sincronizando,
        ultimaSync,
        erro,
        sincronizar,
        recarregarPendentes,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
