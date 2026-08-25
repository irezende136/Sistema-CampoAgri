import { EditarAreaPage } from "@/components/areas/areas-pages";
export default async function EditarAreaRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditarAreaPage areaId={id} />;
}
