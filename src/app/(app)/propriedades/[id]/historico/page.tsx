import { HistoricoPropriedade } from "@/components/propriedades/historico-page";

export default async function HistoricoPropriedadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HistoricoPropriedade propriedadeId={id} />;
}
