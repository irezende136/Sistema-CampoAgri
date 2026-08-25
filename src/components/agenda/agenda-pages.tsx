"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { Check, X, Trash2, CloudUpload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/produtores/whatsapp-button";
import { AgendaForm } from "@/components/agenda/agenda-form";
import { EstadoLista } from "@/components/offline/estado-lista";
import { useLiveQuery } from "@/lib/offline/hooks";
import { listAll } from "@/lib/offline/repo";
import { listOutbox } from "@/lib/offline/outbox";
import {
  criarAgendamentoLocal,
  atualizarStatusAgendamentoLocal,
  removerAgendamentoLocal,
} from "@/lib/offline/cadastros";
import { useOrgCtx } from "@/components/offline/org-context";
import { useSync } from "@/components/offline/sync-provider";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR, todayInSaoPauloISO } from "@/lib/utils/format";

type Agendamento = {
  id: string;
  produtor_id: string;
  propriedade_id: string;
  data_prevista: string;
  horario: string | null;
  objetivo: string | null;
  status: string;
};

type Produtor = { id: string; nome: string; telefone: string | null; whatsapp: string | null };
type Propriedade = { id: string; nome: string; produtor_id: string };

function somarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function rotuloDoGrupo(data: string, hoje: string): string {
  if (data === hoje) return "Hoje";
  if (data === somarDias(hoje, 1)) return "Amanhã";
  const diaSemana = new Date(`${data}T12:00:00Z`).toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  });
  return `${diaSemana.charAt(0).toUpperCase()}${diaSemana.slice(1)}, ${formatDateBR(data)}`;
}

// ---------------------------------------------------------------------------

export function AgendaList() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const [, startTransition] = useTransition();

  const { data, carregando } = useLiveQuery(async () => {
    const [agendamentos, produtores, propriedades, fila] = await Promise.all([
      listAll<Agendamento>("agenda_visitas"),
      listAll<Produtor>("produtores"),
      listAll<Propriedade>("propriedades"),
      listOutbox(),
    ]);
    return {
      agendamentos: agendamentos.sort(
        (a, b) =>
          a.data_prevista.localeCompare(b.data_prevista) ||
          String(a.horario ?? "").localeCompare(String(b.horario ?? ""))
      ),
      produtores: new Map(produtores.map((p) => [p.id, p])),
      propriedades: new Map(propriedades.map((p) => [p.id, p])),
      pendentes: new Set(fila.filter((f) => f.table === "agenda_visitas").map((f) => f.recordId)),
    };
  }, []);

  async function apos(acao: Promise<unknown>) {
    await acao;
    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
  }

  const hoje = todayInSaoPauloISO();
  const todos = data?.agendamentos ?? [];
  const atrasados = todos.filter((a) => a.status === "agendada" && a.data_prevista < hoje);
  const demais = todos.filter((a) => !(a.status === "agendada" && a.data_prevista < hoje));

  const grupos = new Map<string, Agendamento[]>();
  for (const a of demais) {
    if (!grupos.has(a.data_prevista)) grupos.set(a.data_prevista, []);
    grupos.get(a.data_prevista)!.push(a);
  }

  function item(a: Agendamento, atrasado = false) {
    const produtor = data?.produtores.get(a.produtor_id);
    const propriedade = data?.propriedades.get(a.propriedade_id);
    const telefone = produtor?.whatsapp || produtor?.telefone || null;
    const mensagem = `Olá, ${produtor?.nome ?? ""}! Confirmando nossa visita técnica${
      propriedade?.nome ? ` na ${propriedade.nome}` : ""
    } no dia ${formatDateBR(a.data_prevista)}${a.horario ? ` às ${a.horario.slice(0, 5)}` : ""}.`;

    return (
      <Card key={a.id} className={atrasado ? "border-danger/50" : undefined}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold truncate flex items-center gap-1.5">
              {data?.pendentes.has(a.id) && (
                <CloudUpload size={14} className="text-warning shrink-0" aria-label="Ainda não enviado" />
              )}
              {produtor?.nome ?? "—"} — {propriedade?.nome ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {a.horario ? a.horario.slice(0, 5) : "Sem horário"}
              {a.objetivo ? ` · ${a.objetivo}` : ""}
              {atrasado ? ` · previsto para ${formatDateBR(a.data_prevista)}` : ""}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {a.status === "agendada" && telefone && <WhatsAppButton phone={telefone} message={mensagem} />}
            <Badge tone={atrasado ? "danger" : statusTone(a.status)}>
              {atrasado ? "Atrasada" : statusLabel(a.status)}
            </Badge>
            {a.status === "agendada" ? (
              <div className="flex items-center gap-1">
                <Link
                  href={`/visitas/nova?produtor_id=${a.produtor_id}&propriedade_id=${a.propriedade_id}`}
                  className="text-xs text-primary font-medium px-2 py-1 hover:underline"
                >
                  Iniciar visita
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      void apos(atualizarStatusAgendamentoLocal(ctx, a.id, "realizada"));
                    })
                  }
                  className="text-muted-foreground hover:text-success p-1"
                  aria-label="Marcar como realizada"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      void apos(atualizarStatusAgendamentoLocal(ctx, a.id, "cancelada"));
                    })
                  }
                  className="text-muted-foreground hover:text-danger p-1"
                  aria-label="Cancelar"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  startTransition(() => {
                    void apos(removerAgendamentoLocal(ctx, a.id));
                  })
                }
                className="text-muted-foreground hover:text-danger p-1"
                aria-label="Remover"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Agenda de visitas" actionLabel="Agendar visita" actionHref="/agenda/nova" />

      <EstadoLista
        carregando={carregando}
        vazio={todos.length === 0}
        tituloVazio="Nenhuma visita agendada"
        descricaoVazio="Agende a próxima visita técnica para não perder o prazo com o produtor."
        acaoLabel="Agendar visita"
        acaoHref="/agenda/nova"
      >
        <div className="space-y-6">
          {atrasados.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-danger mb-2">Atrasadas ({atrasados.length})</h2>
              <div className="space-y-3">{atrasados.map((a) => item(a, true))}</div>
            </section>
          )}
          {[...grupos.entries()].map(([data_prevista, itens]) => (
            <section key={data_prevista}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                {rotuloDoGrupo(data_prevista, hoje)}
              </h2>
              <div className="space-y-3">{itens.map((a) => item(a))}</div>
            </section>
          ))}
        </div>
      </EstadoLista>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function NovoAgendamentoPage() {
  const ctx = useOrgCtx();
  const { recarregarPendentes, sincronizar } = useSync();
  const router = useRouter();

  const { data } = useLiveQuery(async () => {
    const [produtores, propriedades] = await Promise.all([
      listAll<Produtor>("produtores"),
      listAll<Propriedade>("propriedades"),
    ]);
    return produtores
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        propriedades: propriedades
          .filter((prop) => prop.produtor_id === p.id)
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((prop) => ({ id: prop.id, nome: prop.nome })),
      }));
  }, []);

  async function salvar(dados: FormData) {
    const produtor_id = String(dados.get("produtor_id") ?? "");
    const propriedade_id = String(dados.get("propriedade_id") ?? "");
    const data_prevista = String(dados.get("data_prevista") ?? "").trim();

    if (!produtor_id || !propriedade_id) throw new Error("Selecione produtor e propriedade.");
    if (!data_prevista) throw new Error("Informe a data prevista.");

    await criarAgendamentoLocal(ctx, {
      produtor_id,
      propriedade_id,
      data_prevista,
      horario: String(dados.get("horario") ?? "").trim() || null,
      objetivo: String(dados.get("objetivo") ?? "").trim() || null,
      observacoes: String(dados.get("observacoes") ?? "").trim() || null,
    });

    await recarregarPendentes();
    if (navigator.onLine) void sincronizar();
    router.push("/agenda");
  }

  return (
    <div>
      <PageHeader title="Agendar visita" backHref="/agenda" />
      <Card>
        <CardContent>
          <AgendaForm produtores={data ?? []} aoSalvar={salvar} />
        </CardContent>
      </Card>
    </div>
  );
}
