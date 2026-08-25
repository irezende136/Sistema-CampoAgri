import { ProdutorDetalhe } from "@/components/produtores/produtores-pages";

export default async function ProdutorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProdutorDetalhe produtorId={id} />;
}
