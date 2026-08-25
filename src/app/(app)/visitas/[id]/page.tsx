import { VisitaDetalhe } from "@/components/visitas/visita-detalhe";

// A visita é lida do banco local para funcionar sem sinal — inclusive uma
// visita criada no talhão que ainda não subiu para o servidor.
export default async function VisitaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VisitaDetalhe visitaId={id} />;
}
