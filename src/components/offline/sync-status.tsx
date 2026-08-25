"use client";

import { useSyncExternalStore } from "react";
import { RefreshCw, CloudOff, CloudUpload, Check, WifiOff } from "lucide-react";
import { useSync } from "./sync-provider";
import { formatDateTimeBR } from "@/lib/utils/format";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function SyncStatus() {
  const { pendentes, sincronizando, ultimaSync, erro, sincronizar } = useSync();
  const offline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false
  );

  const { Icon, texto, cor, girando } = (() => {
    if (sincronizando) {
      return { Icon: RefreshCw, texto: "Sincronizando...", cor: "text-muted-foreground", girando: true };
    }
    if (offline) {
      return {
        Icon: WifiOff,
        texto: pendentes > 0 ? `${pendentes} para enviar` : "Sem conexão",
        cor: "text-warning",
        girando: false,
      };
    }
    if (pendentes > 0) {
      return { Icon: CloudUpload, texto: `${pendentes} para enviar`, cor: "text-warning", girando: false };
    }
    if (erro) {
      return { Icon: CloudOff, texto: "Falha ao sincronizar", cor: "text-danger", girando: false };
    }
    return { Icon: Check, texto: "Tudo sincronizado", cor: "text-success", girando: false };
  })();

  const titulo = [
    ultimaSync ? `Última sincronização: ${formatDateTimeBR(ultimaSync)}` : "Ainda não sincronizado",
    erro ? `Erro: ${erro}` : null,
    offline ? "Suas alterações estão salvas no aparelho e sobem quando a conexão voltar." : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <button
      type="button"
      onClick={() => void sincronizar()}
      disabled={sincronizando || offline}
      title={titulo}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:cursor-default ${cor}`}
    >
      <Icon size={15} className={girando ? "animate-spin" : undefined} />
      <span className="hidden sm:inline">{texto}</span>
      {pendentes > 0 && <span className="sm:hidden">{pendentes}</span>}
    </button>
  );
}
