import { RecomendacaoPage } from "@/components/visitas/recomendacao-page";

export default async function NovaRecomendacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecomendacaoPage visitaId={id} />;
}
