"use client";

import { WifiOff, RotateCw } from "lucide-react";

// Página de fallback servida pelo service worker quando não há conexão
// e a página pedida não está no cache. Precisa ser estática e pública.
export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <WifiOff size={26} />
        </div>
        <h1 className="text-lg font-semibold">Você está sem conexão</h1>
        <p className="text-sm text-muted-foreground">
          Esta página ainda não foi salva no seu dispositivo. As telas que você já abriu
          (dashboard, produtores, visitas, agenda) continuam disponíveis para consulta offline.
        </p>
        <p className="text-xs text-muted-foreground">
          Para registrar ou editar dados é preciso estar conectado.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 h-11 text-sm font-medium"
        >
          <RotateCw size={16} /> Tentar novamente
        </button>
      </div>
    </div>
  );
}
