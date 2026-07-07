import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProdutoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await requireOrgContext();
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("produtores")
    .select("id, nome, telefone, whatsapp, cidade, estado")
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("nome");

  if (q) query = query.ilike("nome", `%${q}%`);

  const { data: produtores } = await query;

  return (
    <div>
      <PageHeader title="Produtores" actionLabel="Novo produtor" actionHref="/produtores/novo" />

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar produtor por nome..."
          className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm"
        />
      </form>

      {!produtores || produtores.length === 0 ? (
        <EmptyState
          title="Nenhum produtor cadastrado"
          description="Cadastre o primeiro produtor para começar a registrar propriedades e visitas."
          actionLabel="Novo produtor"
          actionHref="/produtores/novo"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {produtores.map((p) => (
            <Link key={p.id} href={`/produtores/${p.id}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardContent>
                  <div className="font-semibold">{p.nome}</div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {p.telefone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} /> {p.telefone}
                      </div>
                    )}
                    {(p.cidade || p.estado) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} /> {[p.cidade, p.estado].filter(Boolean).join(" - ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
