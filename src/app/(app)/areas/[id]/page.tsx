import { AreaDetalhe } from "@/components/areas/areas-pages";
export default async function AreaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AreaDetalhe areaId={id} />;
}
