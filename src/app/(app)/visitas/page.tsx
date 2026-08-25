import { VisitasList } from "@/components/visitas/visitas-list";

// A listagem lê do banco local (IndexedDB) para funcionar sem sinal.
// A sincronização mantém essa cópia em dia com o servidor.
export default function VisitasPage() {
  return <VisitasList />;
}
