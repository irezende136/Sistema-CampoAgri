import { OcorrenciaPage } from "@/components/visitas/ocorrencia-page";

export default async function NovaOcorrenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OcorrenciaPage visitaId={id} />;
}
