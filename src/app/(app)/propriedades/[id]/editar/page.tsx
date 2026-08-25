import { EditarPropriedadePage } from "@/components/propriedades/propriedades-pages";
export default async function EditarPropriedadeRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditarPropriedadePage propriedadeId={id} />;
}
