"use client";

import { Loader2, CloudOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSync } from "./sync-provider";

/**
 * Estados de uma listagem lida do banco local.
 *
 * Distinguir "vazio" de "ainda não baixei os dados" é essencial: se a primeira
 * sincronização falhar, mostrar "nenhum registro" faz o usuário achar que
 * perdeu tudo. Aqui ele vê o motivo real e um botão para tentar de novo.
 */
export function EstadoLista({
  carregando,
  vazio,
  tituloVazio,
  descricaoVazio,
  acaoLabel,
  acaoHref,
  children,
}: {
  carregando: boolean;
  vazio: boolean;
  tituloVazio: string;
  descricaoVazio?: string;
  acaoLabel?: string;
  acaoHref?: string;
  children: React.ReactNode;
}) {
  const { nuncaSincronizou, armazenamentoIndisponivel, sincronizando, erro, sincronizar } = useSync();

  if (armazenamentoIndisponivel) {
    return (
      <div className="rounded-xl border border-danger/40 bg-danger/5 p-5 text-center space-y-2">
        <AlertTriangle size={22} className="mx-auto text-danger" />
        <h3 className="font-semibold">Armazenamento bloqueado neste navegador</h3>
        <p className="text-sm text-muted-foreground">
          O app guarda os dados no aparelho para funcionar sem sinal, mas este navegador está
          impedindo isso — costuma acontecer em janela anônima ou com cookies de site bloqueados.
          Abra em uma janela normal para usar o sistema.
        </p>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
        <Loader2 size={16} className="animate-spin" /> Carregando...
      </div>
    );
  }

  // Vazio + nunca sincronizado: não é "não existe nada", é "ainda não baixamos".
  if (vazio && nuncaSincronizou) {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/5 p-5 text-center space-y-3">
        <CloudOff size={22} className="mx-auto text-warning" />
        <div>
          <h3 className="font-semibold">Dados ainda não baixados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Este aparelho ainda não sincronizou com o servidor, então nada aparece aqui.
            {erro ? ` Motivo: ${erro}` : " Verifique sua conexão e tente novamente."}
          </p>
        </div>
        <Button type="button" onClick={() => void sincronizar()} disabled={sincronizando}>
          <RefreshCw size={16} className={sincronizando ? "animate-spin" : undefined} />
          {sincronizando ? "Sincronizando..." : "Sincronizar agora"}
        </Button>
      </div>
    );
  }

  if (vazio) {
    return (
      <EmptyState
        title={tituloVazio}
        description={descricaoVazio}
        actionLabel={acaoLabel}
        actionHref={acaoHref}
      />
    );
  }

  return <>{children}</>;
}
