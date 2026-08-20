import { requireOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/produtores/whatsapp-button";
import { statusTone, statusLabel } from "@/lib/domain/status-tones";
import { formatDateBR, todayInSaoPauloISO } from "@/lib/utils/format";
import { AgendaItemActions } from "@/components/agenda/agenda-item-actions";

type Agendamento = {
  id: string;
  data_prevista: string;
  horario: string | null;
  objetivo: string | null;
  status: string;
  produtor_id: string;
  produtores?: { nome?: string; telefone?: string | null; whatsapp?: string | null } | null;
  propriedades?: { id: string; nome?: string } | null;
};

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function groupLabel(data: string, hoje: string): string {
  if (data === hoje) return "Hoje";
  if (data === addDaysISO(hoje, 1)) return "Amanhã";
  const weekday = new Date(`${data}T12:00:00Z`).toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${formatDateBR(data)}`;
}

export default async function AgendaPage() {
  const ctx = await requireOrgContext();
  const supabase = await createClient();

  const { data } = await supabase
    .from("agenda_visitas")
    .select(
      "id, data_prevista, horario, objetivo, status, produtor_id, produtores(nome, telefone, whatsapp), propriedades(id, nome)"
    )
    .eq("organization_id", ctx.organizationId)
    .is("deleted_at", null)
    .order("data_prevista", { ascending: true })
    .order("horario", { ascending: true, nullsFirst: false });

  const agendamentos = (data ?? []) as unknown as Agendamento[];
  const hoje = todayInSaoPauloISO();

  const atrasados = agendamentos.filter((a) => a.status === "agendada" && a.data_prevista < hoje);
  const futuros = agendamentos.filter((a) => !(a.status === "agendada" && a.data_prevista < hoje));

  const grupos = new Map<string, Agendamento[]>();
  for (const a of futuros) {
    const key = a.data_prevista;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(a);
  }

  function renderItem(a: Agendamento, atrasado = false) {
    const telefoneWhats = a.produtores?.whatsapp || a.produtores?.telefone || null;
    const mensagem = `Olá, ${a.produtores?.nome ?? ""}! Confirmando nossa visita técnica${
      a.propriedades?.nome ? ` na ${a.propriedades.nome}` : ""
    } no dia ${formatDateBR(a.data_prevista)}${a.horario ? ` às ${a.horario.slice(0, 5)}` : ""}.`;

    return (
      <Card key={a.id} className={atrasado ? "border-danger/50" : undefined}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {a.produtores?.nome} — {a.propriedades?.nome}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {a.horario ? `${a.horario.slice(0, 5)}` : "Sem horário"}
              {a.objetivo ? ` · ${a.objetivo}` : ""}
              {atrasado ? ` · previsto para ${formatDateBR(a.data_prevista)}` : ""}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {a.status === "agendada" && telefoneWhats && (
              <WhatsAppButton phone={telefoneWhats} message={mensagem} />
            )}
            <Badge tone={atrasado ? "danger" : statusTone(a.status)}>
              {atrasado ? "Atrasada" : statusLabel(a.status)}
            </Badge>
            <AgendaItemActions
              id={a.id}
              status={a.status}
              produtorId={a.produtor_id}
              propriedadeId={a.propriedades?.id}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Agenda de visitas" actionLabel="Agendar visita" actionHref="/agenda/nova" />

      {agendamentos.length === 0 ? (
        <EmptyState
          title="Nenhuma visita agendada"
          description="Agende a próxima visita técnica para não perder o prazo com o produtor."
          actionLabel="Agendar visita"
          actionHref="/agenda/nova"
        />
      ) : (
        <div className="space-y-6">
          {atrasados.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-danger mb-2">
                Atrasadas ({atrasados.length})
              </h2>
              <div className="space-y-3">{atrasados.map((a) => renderItem(a, true))}</div>
            </section>
          )}

          {[...grupos.entries()].map(([dataPrevista, itens]) => (
            <section key={dataPrevista}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                {groupLabel(dataPrevista, hoje)}
              </h2>
              <div className="space-y-3">{itens.map((a) => renderItem(a))}</div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
