"use client";

import Link from "next/link";
import { ClipboardList, FileText, CloudUpload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EstadoLista } from "@/components/offline/estado-lista";
import { useLiveQuery } from "@/lib/offline/hooks";
import { getById, listWhere } from "@/lib/offline/repo";
import { listOutbox } from "@/lib/offline/outbox";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";

type Evento = {
  id: string;
  tipo: "visita" | "relatorio";
  data: string;
  titulo: string;
  descricao?: string | null;
  href: string;
  status?: string | null;
  pendente?: boolean;
};

export function HistoricoPropriedade({ propriedadeId }: { propriedadeId: string }) {
  const { data, carregando } = useLiveQuery(async () => {
    const propriedade = await getById<{ id: string; nome: string; produtor_id: string }>(
      "propriedades",
      propriedadeId
    );
    if (!propriedade) return { propriedade: null, produtor: null, eventos: [] as Evento[] };

    const [produtor, visitas, relatorios, fila] = await Promise.all([
      getById<{ id: string; nome: string }>("produtores", propriedade.produtor_id),
      listWhere<{
        id: string;
        data_visita: string;
        objetivo: string | null;
        status: string;
        resumo_geral: string | null;
      }>("visitas", { propriedade_id: propriedadeId }),
      listWhere<{ id: string; data_geracao: string; codigo: string | null }>("relatorios", {
        propriedade_id: propriedadeId,
      }),
      listOutbox(),
    ]);

    const naoEnviados = new Set(fila.map((f) => f.recordId));

    const eventos: Evento[] = [
      ...visitas.map((v) => ({
        id: v.id,
        tipo: "visita" as const,
        data: v.data_visita,
        titulo: v.objetivo || "Visita técnica",
        descricao: v.resumo_geral,
        href: `/visitas/${v.id}`,
        status: v.status,
        pendente: naoEnviados.has(v.id),
      })),
      ...relatorios.map((r) => ({
        id: r.id,
        tipo: "relatorio" as const,
        data: r.data_geracao,
        titulo: `Relatório gerado${r.codigo ? " — " + r.codigo : ""}`,
        href: `/relatorios/${r.id}`,
      })),
    ];

    // Ordem cronológica decrescente. As datas convivem em formatos diferentes
    // (data_visita é DATE, data_geracao é timestamp), então comparamos os
    // primeiros 10 caracteres — o dia — para não misturar a ordenação.
    eventos.sort((a, b) => String(b.data).slice(0, 10).localeCompare(String(a.data).slice(0, 10)));

    return { propriedade, produtor, eventos };
  }, [propriedadeId]);

  const eventos = data?.eventos ?? [];

  return (
    <div>
      <PageHeader
        title={data?.propriedade ? `Histórico — ${data.propriedade.nome}` : "Histórico"}
        description={data?.produtor?.nome ? `Produtor: ${data.produtor.nome}` : undefined}
        backHref={`/propriedades/${propriedadeId}`}
      />

      <EstadoLista
        carregando={carregando}
        vazio={eventos.length === 0}
        tituloVazio="Nenhum histórico ainda"
        descricaoVazio="Visitas e relatórios gerados para esta propriedade aparecerão aqui em ordem cronológica."
      >
        <div className="relative pl-6 border-l-2 border-border space-y-4">
          {eventos.map((e) => (
            <div key={`${e.tipo}-${e.id}`} className="relative">
              <div className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-primary" />
              <Link href={e.href}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {e.tipo === "visita" ? <ClipboardList size={14} /> : <FileText size={14} />}
                        {formatDateBR(e.data)}
                        {e.pendente && (
                          <span className="inline-flex items-center gap-1 text-warning">
                            <CloudUpload size={12} /> não enviada
                          </span>
                        )}
                      </div>
                      <div className="font-medium">{e.titulo}</div>
                      {e.descricao && (
                        <div className="text-sm text-muted-foreground truncate">{e.descricao}</div>
                      )}
                    </div>
                    {e.status && <Badge tone={statusTone(e.status)}>{statusLabel(e.status)}</Badge>}
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </EstadoLista>
    </div>
  );
}
