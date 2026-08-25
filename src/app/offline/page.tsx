"use client";

import { WifiOff, RotateCw, ClipboardList } from "lucide-react";

// Página de fallback servida pelo service worker quando não há conexão
// e a página pedida não está no cache. Precisa ser estática e pública.
export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <WifiOff size={26} />
        </div>
        <h1 className="text-lg font-semibold">Esta tela ainda não foi salva</h1>
        <p className="text-sm text-muted-foreground">
          Você está sem conexão e esta tela específica ainda não tinha sido aberta neste
          aparelho. Suas outras telas continuam funcionando normalmente.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Você pode continuar trabalhando:</strong> registrar
          visitas, ocorrências, fotos e cadastros funciona sem sinal. Tudo fica salvo no aparelho
          e sobe sozinho quando a conexão voltar.
        </p>
        <div className="flex flex-col gap-2 pt-1">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
              navegação completa de propósito: passa pelo service worker e acha o
              HTML salvo. A navegação do Next buscaria dados que podem não estar
              em cache e falharia sem sinal. */}
          <a
            href="/visitas"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 h-11 text-sm font-medium"
          >
            <ClipboardList size={16} /> Ir para as visitas
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 h-11 text-sm font-medium"
          >
            <RotateCw size={16} /> Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
