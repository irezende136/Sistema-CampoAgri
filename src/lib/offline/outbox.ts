import { OUTBOX_STORE, idbAdd, idbDelete, idbGetAll, idbPut, type SyncedTable } from "./idb";

export type OutboxOp = "insert" | "update" | "delete";

export type OutboxItem = {
  seq?: number;
  table: SyncedTable;
  op: OutboxOp;
  recordId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  tries: number;
  lastError?: string;
};

/**
 * Enfileira uma alteração para subir ao servidor.
 *
 * A ordem de inserção é preservada (chave autoincremental) porque ela carrega
 * as dependências: se o usuário criou uma visita e, em seguida, uma ocorrência
 * dentro dela, a visita precisa subir primeiro para a FK existir.
 */
export async function enqueue(
  table: SyncedTable,
  op: OutboxOp,
  recordId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const item: OutboxItem = {
    table,
    op,
    recordId,
    payload,
    createdAt: new Date().toISOString(),
    tries: 0,
  };
  await idbAdd(OUTBOX_STORE, item);
}

export async function listOutbox(): Promise<OutboxItem[]> {
  const items = await idbGetAll<OutboxItem>(OUTBOX_STORE);
  return items.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
}

export async function countPending(): Promise<number> {
  const items = await idbGetAll<OutboxItem>(OUTBOX_STORE);
  return items.length;
}

export async function removeFromOutbox(seq: number): Promise<void> {
  await idbDelete(OUTBOX_STORE, seq);
}

export async function markFailure(item: OutboxItem, error: string): Promise<void> {
  if (item.seq === undefined) return;
  await idbPut(OUTBOX_STORE, { ...item, tries: item.tries + 1, lastError: error });
}
