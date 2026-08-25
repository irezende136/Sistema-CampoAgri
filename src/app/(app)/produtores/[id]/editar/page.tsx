import { EditarProdutorPage } from "@/components/produtores/produtores-pages";

export default async function EditarProdutorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditarProdutorPage produtorId={id} />;
}
