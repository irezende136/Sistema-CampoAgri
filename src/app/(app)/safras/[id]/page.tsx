import { SafraDetalhe } from "@/components/safras/safras-pages";
export default async function SafraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SafraDetalhe safraId={id} />;
}
