"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { syncNow, getLastSyncAt } from "@/lib/offline/sync";
import { countPending } from "@/lib/offline/outbox";
import { prepararTelasOffline } from "@/lib/offline/precache";
import type { Ctx } from "@/lib/offline/repo";

type SyncState = {
  ctx: Ctx;
  pendentes: number;
  sincronizando: boolean;
  ultimaSync: string | null;
  erro: string | null;
  /** Falso até a primeira tentativa de sincronizar terminar. Evita mostrar
   *  "nada cadastrado" antes de sabermos se há dados a baixar. */
  iniciado: boolean;
  /** Nunca houve uma sincronização bem-sucedida neste aparelho. */
  nuncaSincronizou: boolean;
  /** IndexedDB indisponível (navegação privada, armazenamento bloqueado). */
  armazenamentoIndisponivel: boolean;
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
  const [iniciado, setIniciado] = useState(false);
  const [armazenamentoIndisponivel, setArmazenamentoIndisponivel] = useState(false);

  const emAndamento = useRef(false);

  const recarregarPendentes = useCallback(async () => {
    try {
      setPendentes(await countPending());
      setArmazenamentoIndisponivel(false);
    } catch {
      // Sem IndexedDB o app não guarda nada localmente — o usuário precisa
      // saber, senão parece que os dados sumiram.
      setArmazenamentoIndisponivel(true);
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

      // Com os dados no aparelho, garante que as telas para vê-los também
      // estejam salvas — senão o app fica sem sinal com dados e sem telas.
      if (r.ok) void prepararTelasOffline();
    } finally {
      emAndamento.current = false;
      setSincronizando(false);
      setIniciado(true);
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
        iniciado,
        nuncaSincronizou: iniciado && ultimaSync === null,
        armazenamentoIndisponivel,
        sincronizar,
        recarregarPendentes,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
