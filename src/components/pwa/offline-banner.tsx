"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const offline = useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false
  );

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-50 bg-warning text-white text-xs font-medium px-3 py-2 flex items-center justify-center gap-2">
      <WifiOff size={14} />
      Sem conexão — mostrando dados salvos. Alterações só podem ser feitas online.
    </div>
  );
}
