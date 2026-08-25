import { EditarSafraPage } from "@/components/safras/safras-pages";
export default async function EditarSafraRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditarSafraPage safraId={id} />;
}
