import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTimeBR } from "@/lib/utils/format";

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data: relatorio } = await supabase
    .from("relatorios")
    .select("*, produtores(nome), propriedades(nome), visitas(id)")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!relatorio) notFound();

  const produtor = (relatorio as unknown as { produtores: { nome: string } }).produtores;
  const propriedade = (relatorio as unknown as { propriedades: { nome: string } }).propriedades;
  const visita = (relatorio as unknown as { visitas: { id: string } }).visitas;

  let signedUrl: string | null = null;
  if (relatorio.storage_path) {
    const { data } = await supabase.storage.from("campoagri").createSignedUrl(relatorio.storage_path, 3600);
    signedUrl = data?.signedUrl ?? null;
  }

  return (
    <div>
      <PageHeader
        title={`Relatório ${relatorio.codigo ?? ""}`}
        description={`${produtor?.nome} — ${propriedade?.nome}`}
        backHref={visita ? `/visitas/${visita.id}` : "/visitas"}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Gerado em {formatDateTimeBR(relatorio.data_geracao)}
          </div>
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground font-medium px-4 h-11 text-sm hover:brightness-95"
            >
              <Download size={18} /> Baixar / visualizar PDF
            </a>
          )}
        </CardContent>
      </Card>

      {signedUrl && (
        <Card className="overflow-hidden">
          <iframe src={signedUrl} className="w-full h-[75vh]" title="Relatório PDF" />
        </Card>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        Compartilhe este PDF com o produtor por WhatsApp, e-mail ou outro meio de sua preferência.
      </p>
    </div>
  );
}
