import { AvaliacaoPage } from "@/components/visitas/avaliacao-page";

export default async function AvaliacaoAreaPage({
  params,
}: {
  params: Promise<{ id: string; avaliacaoId: string }>;
}) {
  const { id, avaliacaoId } = await params;
  return <AvaliacaoPage visitaId={id} avaliacaoId={avaliacaoId} />;
}
