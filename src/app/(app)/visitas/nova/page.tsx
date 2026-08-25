import { Suspense } from "react";
import { NovaVisita } from "@/components/visitas/nova-visita";

// Fluxo de criação roda no cliente, gravando no banco local: o agrônomo
// consegue abrir a visita no talhão mesmo sem sinal.
export default function NovaVisitaPage() {
  return (
    <Suspense>
      <NovaVisita />
    </Suspense>
  );
}
