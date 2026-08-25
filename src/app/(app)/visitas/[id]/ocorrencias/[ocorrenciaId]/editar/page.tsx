import { OcorrenciaPage } from "@/components/visitas/ocorrencia-page";

export default async function EditarOcorrenciaPage({
  params,
}: {
  params: Promise<{ id: string; ocorrenciaId: string }>;
}) {
  const { id, ocorrenciaId } = await params;
  return <OcorrenciaPage visitaId={id} ocorrenciaId={ocorrenciaId} />;
}
