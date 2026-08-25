import { PropriedadeDetalhe } from "@/components/propriedades/propriedades-pages";
export default async function PropriedadeDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropriedadeDetalhe propriedadeId={id} />;
}
