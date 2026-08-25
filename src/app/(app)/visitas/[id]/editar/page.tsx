import { EditarVisitaPage } from "@/components/visitas/editar-visita-page";

export default async function EditarVisitaRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditarVisitaPage visitaId={id} />;
}
