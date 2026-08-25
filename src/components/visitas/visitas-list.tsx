"use client";

import Link from "next/link";
import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR } from "@/lib/utils/format";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listAll } from "@/lib/offline/repo";
import { listOutbox } from "@/lib/offline/outbox";
import { EstadoLista } from "@/components/offline/estado-lista";

const STATUS_OPTIONS = [
  ["", "Todos os status"],
  ["rascunho", "Rascunho"],
  ["finalizada", "Finalizada"],
  ["relatorio_gerado", "Relatório gerado"],
];

type Visita = {
  id: string;
  data_visita: string;
  objetivo: string | null;
  status: string;
  produtor_id: string;
  propriedade_id: string;
};

export function VisitasList() {
  const [status, setStatus] = useState("");
  const [propriedadeId, setPropriedadeId] = useState("");

  const { data, carregando } = useLiveQuery(async () => {
    const [visitas, produtores, propriedades, pendentes] = await Promise.all([
      listAll<Visita>("visitas"),
      listAll<{ id: string; nome: string }>("produtores"),
      listAll<{ id: string; nome: string }>("propriedades"),
      listOutbox(),
    ]);

    // Marca o que ainda não subiu, para o usuário saber o que está só no aparelho.
    const naoEnviados = new Set(pendentes.filter((p) => p.table === "visitas").map((p) => p.recordId));

    return {
      visitas: visitas.sort((a, b) => b.data_visita.localeCompare(a.data_visita)),
      produtores: new Map(produtores.map((p) => [p.id, p.nome])),
      propriedades: propriedades.sort((a, b) => a.nome.localeCompare(b.nome)),
      naoEnviados,
    };
  }, []);

  const nomePropriedade = new Map((data?.propriedades ?? []).map((p) => [p.id, p.nome]));
  const filtradas = (data?.visitas ?? []).filter(
    (v) => (!status || v.status === status) && (!propriedadeId || v.propriedade_id === propriedadeId)
  );

  return (
    <div>
      <PageHeader title="Visitas técnicas" actionLabel="Nova visita" actionHref="/visitas/nova" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={propriedadeId} onChange={(e) => setPropriedadeId(e.target.value)}>
          <option value="">Todas as propriedades</option>
          {(data?.propriedades ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </div>

      <EstadoLista
        carregando={carregando}
        vazio={filtradas.length === 0}
        tituloVazio="Nenhuma visita encontrada"
        descricaoVazio="Registre sua primeira visita técnica: selecione o produtor, a propriedade e comece a avaliar as áreas."
        acaoLabel="Nova visita"
        acaoHref="/visitas/nova"
      >
        <div className="space-y-3">
          {filtradas.map((v) => (
            <Link key={v.id} href={`/visitas/${v.id}`}>
              <Card className="hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate flex items-center gap-1.5">
                      {data?.naoEnviados.has(v.id) && (
                        <CloudUpload size={14} className="text-warning shrink-0" aria-label="Ainda não enviada" />
                      )}
                      {data?.produtores.get(v.produtor_id) ?? "—"} — {nomePropriedade.get(v.propriedade_id) ?? "—"}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{v.objetivo}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">{formatDateBR(v.data_visita)}</span>
                    <Badge tone={statusTone(v.status)}>{statusLabel(v.status)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </EstadoLista>
    </div>
  );
}
