import { idbGet, idbGetAll, idbPut, idbDelete, BLOB_STORE, type SyncedTable } from "./idb";
import { enqueue } from "./outbox";
import { emitLocalChange } from "./events";

type Row = Record<string, unknown> & {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

/**
 * IDs são gerados aqui, no aparelho, e não pelo banco.
 *
 * É o que torna a escrita offline viável: o registro já nasce com identidade
 * definitiva, então um filho criado em seguida (uma ocorrência dentro de uma
 * visita, por exemplo) consegue referenciar o pai antes de qualquer contato
 * com o servidor. O Postgres aceita o uuid enviado pelo cliente.
 */
export function newId(): string {
  return crypto.randomUUID();
}

export type Ctx = { organizationId: string; userId: string };

// ---------------------------------------------------------------------------
// Leitura (sempre do banco local — funciona com ou sem sinal)
// ---------------------------------------------------------------------------

export async function listAll<T extends Row>(table: SyncedTable): Promise<T[]> {
  const rows = await idbGetAll<T>(table);
  return rows.filter((r) => !r.deleted_at);
}

export async function listWhere<T extends Row>(
  table: SyncedTable,
  match: Partial<Record<string, unknown>>
): Promise<T[]> {
  const rows = await listAll<T>(table);
  return rows.filter((r) => Object.entries(match).every(([k, v]) => r[k] === v));
}

export async function getById<T extends Row>(table: SyncedTable, id: string): Promise<T | null> {
  const row = await idbGet<T>(table, id);
  return row && !row.deleted_at ? row : null;
}

// ---------------------------------------------------------------------------
// Escrita (local primeiro; o servidor recebe quando houver sinal)
// ---------------------------------------------------------------------------

export async function create<T extends Row>(
  table: SyncedTable,
  ctx: Ctx,
  values: Record<string, unknown>
): Promise<T> {
  const agora = new Date().toISOString();
  const registro = {
    ...values,
    id: (values.id as string) ?? newId(),
    organization_id: ctx.organizationId,
    created_by: ctx.userId,
    updated_by: ctx.userId,
    created_at: agora,
    updated_at: agora,
    deleted_at: null,
  } as unknown as T;

  await idbPut(table, registro);
  await enqueue(table, "insert", registro.id, registro as Record<string, unknown>);
  emitLocalChange();
  return registro;
}

export async function update<T extends Row>(
  table: SyncedTable,
  ctx: Ctx,
  id: string,
  changes: Record<string, unknown>
): Promise<T | null> {
  const atual = await idbGet<T>(table, id);
  if (!atual) return null;

  const agora = new Date().toISOString();
  const atualizado = { ...atual, ...changes, updated_by: ctx.userId, updated_at: agora } as T;

  await idbPut(table, atualizado);
  // Envia só os campos alterados: se outra pessoa mexeu em campos diferentes
  // do mesmo registro, as duas edições convivem em vez de uma apagar a outra.
  await enqueue(table, "update", id, { ...changes, updated_by: ctx.userId, updated_at: agora });
  emitLocalChange();
  return atualizado;
}

export async function remove(table: SyncedTable, ctx: Ctx, id: string): Promise<void> {
  const atual = await idbGet<Row>(table, id);
  if (!atual) return;

  const agora = new Date().toISOString();
  await idbPut(table, { ...atual, deleted_at: agora, updated_by: ctx.userId, updated_at: agora });
  await enqueue(table, "delete", id, { deleted_at: agora });
  emitLocalChange();
}

// ---------------------------------------------------------------------------
// Fotos
// ---------------------------------------------------------------------------

/**
 * Guarda a foto no aparelho e registra a linha correspondente. O arquivo em si
 * sobe para o Storage na próxima sincronização; até lá a galeria mostra a
 * imagem lendo o blob local.
 */
export async function savePhotoOffline(
  ctx: Ctx,
  input: { visitaId: string; propriedadeId?: string | null; areaId?: string | null; legenda?: string | null },
  file: Blob,
  extensao: string
): Promise<Row> {
  const id = newId();
  const path = `${ctx.organizationId}/${input.visitaId}/${id}.${extensao}`;

  await idbPut(BLOB_STORE, { id, path, blob: file, visitaId: input.visitaId });

  return create("fotos", ctx, {
    id,
    visita_id: input.visitaId,
    propriedade_id: input.propriedadeId ?? null,
    area_id: input.areaId ?? null,
    legenda: input.legenda ?? null,
    storage_path: path,
  });
}

/** URL temporária para exibir uma foto que ainda não subiu. */
export async function localPhotoUrl(fotoId: string): Promise<string | null> {
  const item = await idbGet<{ id: string; blob: Blob }>(BLOB_STORE, fotoId);
  return item ? URL.createObjectURL(item.blob) : null;
}

export async function discardPhotoBlob(fotoId: string): Promise<void> {
  await idbDelete(BLOB_STORE, fotoId);
}
