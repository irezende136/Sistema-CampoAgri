import { RecomendacaoPage } from "@/components/visitas/recomendacao-page";

export default async function EditarRecomendacaoPage({
  params,
}: {
  params: Promise<{ id: string; recomendacaoId: string }>;
}) {
  const { id, recomendacaoId } = await params;
  return <RecomendacaoPage visitaId={id} recomendacaoId={recomendacaoId} />;
}
