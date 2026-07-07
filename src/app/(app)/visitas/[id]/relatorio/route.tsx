import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { getVisitReportData } from "@/lib/data/visit-report";
import { VisitReportDocument } from "@/lib/pdf/visit-report-document";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const data = await getVisitReportData(ctx.organizationId, id);
  if (!data) return NextResponse.json({ error: "Visita não encontrada." }, { status: 404 });

  if (data.visita.status === "rascunho") {
    return NextResponse.json({ error: "Finalize a visita antes de gerar o relatório." }, { status: 400 });
  }

  const supabase = await createClient();
  const codigo = `V${data.visita.data_visita.replace(/-/g, "")}-${id.slice(0, 6).toUpperCase()}`;

  const buffer = await renderToBuffer(<VisitReportDocument data={data} codigo={codigo} />);
  const storagePath = `${ctx.organizationId}/relatorios/${id}-${Date.now()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("campoagri")
    .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: relatorio, error: insertError } = await supabase
    .from("relatorios")
    .insert({
      organization_id: ctx.organizationId,
      visita_id: id,
      produtor_id: data.visita.produtor_id,
      propriedade_id: data.visita.propriedade_id,
      codigo,
      storage_path: storagePath,
      gerado_por: ctx.userId,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("visitas")
    .update({ status: "relatorio_gerado", updated_by: ctx.userId })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  await supabase.rpc("log_action", {
    p_organization_id: ctx.organizationId,
    p_acao: "gerar_relatorio",
    p_entidade: "relatorios",
    p_entidade_id: relatorio.id,
  });

  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/relatorios/${relatorio.id}`, url.origin));
}
