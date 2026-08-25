import { createClient } from "@/lib/supabase/client";
import {
  BLOB_STORE,
  META_STORE,
  SYNCED_TABLES,
  idbDelete,
  idbGet,
  idbGetAll,
  idbPut,
  idbPutMany,
  type SyncedTable,
} from "./idb";
import { listOutbox, markFailure, removeFromOutbox, type OutboxItem } from "./outbox";
import { emitLocalChange } from "./events";

type Row = Record<string, unknown> & { id: string; updated_at?: string };

const MAX_TRIES = 5;

// ---------------------------------------------------------------------------
// Metadados de sincronização
// ---------------------------------------------------------------------------

async function getLastPulledAt(table: SyncedTable): Promise<string | null> {
  const meta = await idbGet<{ key: string; value: string }>(META_STORE, `pulled:${table}`);
  return meta?.value ?? null;
}

async function setLastPulledAt(table: SyncedTable, value: string): Promise<void> {
  await idbPut(META_STORE, { key: `pulled:${table}`, value });
}

export async function getLastSyncAt(): Promise<string | null> {
  const meta = await idbGet<{ key: string; value: string }>(META_STORE, "lastSyncAt");
  return meta?.value ?? null;
}

async function setLastSyncAt(value: string): Promise<void> {
  await idbPut(META_STORE, { key: "lastSyncAt", value });
}

// ---------------------------------------------------------------------------
// Descida: servidor → local
// ---------------------------------------------------------------------------

/**
 * Traz do servidor tudo que mudou desde a última descida. Como toda tabela tem
 * `updated_at` mantido por trigger, usamos ele como marca d'água — assim a
 * sincronização seguinte transfere só o delta, não a base inteira.
 *
 * Registros excluídos vêm junto (deleted_at preenchido) e são removidos da
 * cópia local; sem isso, algo apagado em outro aparelho reapareceria aqui.
 */
export async function pull(organizationId: string): Promise<void> {
  const supabase = createClient();
  const falhas: string[] = [];

  for (const table of SYNCED_TABLES) {
    const since = await getLastPulledAt(table);

    let query = supabase.from(table).select("*").eq("organization_id", organizationId);
    if (since) query = query.gt("updated_at", since);

    const { data, error } = await query.order("updated_at", { ascending: true }).limit(2000);

    // Uma tabela com problema não pode derrubar as outras: seguimos baixando o
    // resto e reportamos no fim. Antes, `fotos` sem `updated_at` fazia a
    // sincronização inteira falhar e o app parecia quebrado mesmo online.
    if (error) {
      falhas.push(`${table} (${error.message})`);
      continue;
    }

    const rows = (data ?? []) as Row[];
    if (rows.length === 0) continue;

    const vivos = rows.filter((r) => !r.deleted_at);
    const apagados = rows.filter((r) => r.deleted_at);

    await idbPutMany(table, vivos);
    for (const r of apagados) await idbDelete(table, r.id);

    const maisRecente = rows[rows.length - 1]?.updated_at;
    if (maisRecente) await setLastPulledAt(table, maisRecente);
  }

  if (falhas.length > 0) {
    throw new Error(`Falha ao baixar: ${falhas.join("; ")}`);
  }
}

// ---------------------------------------------------------------------------
// Subida: outbox → servidor
// ---------------------------------------------------------------------------

export type PushResult = { enviados: number; falhas: number };

/**
 * Reenvia as alterações feitas offline, na ordem em que foram feitas.
 *
 * Conflito entre aparelhos é resolvido por "última escrita vence", comparando
 * `updated_at`: se a versão do servidor for mais nova que a alteração local,
 * a local é descartada. É a mesma regra do sistema veterinário, e é adequada
 * aqui porque cada registro costuma ser editado por uma pessoa só.
 */
export async function push(): Promise<PushResult> {
  const supabase = createClient();
  const itens = await listOutbox();
  let enviados = 0;
  let falhas = 0;

  for (const item of itens) {
    if (item.seq === undefined) continue;

    // Desiste após várias tentativas para não travar a fila inteira num item
    // problemático — ele fica visível na tela de pendências.
    if (item.tries >= MAX_TRIES) {
      falhas++;
      continue;
    }

    try {
      await aplicar(supabase, item);
      await removeFromOutbox(item.seq);
      enviados++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await markFailure(item, msg);
      falhas++;
      // Para na primeira falha: os itens seguintes podem depender deste
      // (ex.: ocorrência dentro de uma visita que ainda não subiu).
      break;
    }
  }

  return { enviados, falhas };
}

type SupabaseClient = ReturnType<typeof createClient>;

async function aplicar(supabase: SupabaseClient, item: OutboxItem): Promise<void> {
  const tabela = item.table as SyncedTable;

  if (item.op === "insert") {
    // upsert, e não insert: se a tentativa anterior chegou a gravar e só a
    // resposta se perdeu, reenviar não pode gerar registro duplicado.
    const { error } = await supabase.from(tabela).upsert(item.payload as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return;
  }

  if (item.op === "update") {
    const servidor = await buscarUpdatedAt(supabase, tabela, item.recordId);
    const local = String(item.payload.updated_at ?? item.createdAt);
    if (servidor && servidor > local) return; // versão do servidor é mais nova: mantém

    const { error } = await supabase.from(tabela).update(item.payload as never).eq("id", item.recordId);
    if (error) throw new Error(error.message);
    return;
  }

  // Exclusão é lógica em todo o sistema (deleted_at), nunca DELETE físico.
  const { error } = await supabase
    .from(tabela)
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", item.recordId);
  if (error) throw new Error(error.message);
}

async function buscarUpdatedAt(
  supabase: SupabaseClient,
  table: SyncedTable,
  id: string
): Promise<string | null> {
  const { data } = await supabase.from(table).select("updated_at").eq("id", id).maybeSingle();
  return (data as { updated_at?: string } | null)?.updated_at ?? null;
}

// ---------------------------------------------------------------------------
// Fotos tiradas offline
// ---------------------------------------------------------------------------

type PendingBlob = { id: string; path: string; blob: Blob; visitaId: string };

/** Sobe para o Storage as fotos que ficaram guardadas no aparelho. */
export async function pushBlobs(): Promise<number> {
  const supabase = createClient();
  const pendentes = await idbGetAll<PendingBlob>(BLOB_STORE);
  let enviadas = 0;

  for (const item of pendentes) {
    const { error } = await supabase.storage
      .from("campoagri")
      .upload(item.path, item.blob, { upsert: true });

    // "already exists" significa que uma tentativa anterior funcionou.
    if (error && !/exists/i.test(error.message)) continue;

    await idbDelete(BLOB_STORE, item.id);
    enviadas++;
  }

  return enviadas;
}

// ---------------------------------------------------------------------------
// Ciclo completo
// ---------------------------------------------------------------------------

export type SyncOutcome = {
  ok: boolean;
  enviados: number;
  falhas: number;
  fotosEnviadas: number;
  erro?: string;
};

/** Sobe o que está pendente e depois baixa as novidades. */
export async function syncNow(organizationId: string): Promise<SyncOutcome> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false, enviados: 0, falhas: 0, fotosEnviadas: 0, erro: "sem conexão" };
  }

  try {
    const fotosEnviadas = await pushBlobs();
    const { enviados, falhas } = await push();
    await pull(organizationId);
    await setLastSyncAt(new Date().toISOString());
    emitLocalChange();
    return { ok: true, enviados, falhas, fotosEnviadas };
  } catch (e) {
    return {
      ok: false,
      enviados: 0,
      falhas: 0,
      fotosEnviadas: 0,
      erro: e instanceof Error ? e.message : String(e),
    };
  }
}
