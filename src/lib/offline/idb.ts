// Camada mínima sobre o IndexedDB, sem dependência externa.
// Guarda uma cópia local dos dados da organização para o app funcionar
// sem sinal, além da fila de alterações pendentes (outbox).

export const DB_NAME = "campoagri-offline";
// v2: incluiu "relatorios" na sincronização. Subir a versão é o que faz o
// navegador criar o novo armazenamento nos aparelhos que já tinham a v1.
export const DB_VERSION = 2;

// Tabelas espelhadas localmente. A ordem importa no envio: pais antes de
// filhos, para que uma FK criada offline exista quando o filho subir.
export const SYNCED_TABLES = [
  "produtores",
  "propriedades",
  "areas",
  "safras",
  "planejamento_plantio",
  "visitas",
  "avaliacoes_area",
  "ocorrencias",
  "recomendacoes",
  "insumos_custos",
  "agenda_visitas",
  "financeiro_visitas",
  "fotos",
  // Somente leitura: o PDF é gerado no servidor. Fica local para o histórico
  // da propriedade funcionar sem sinal.
  "relatorios",
] as const;

export type SyncedTable = (typeof SYNCED_TABLES)[number];

export const OUTBOX_STORE = "_outbox";
export const META_STORE = "_meta";
export const BLOB_STORE = "_blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      for (const table of SYNCED_TABLES) {
        if (!db.objectStoreNames.contains(table)) {
          db.createObjectStore(table, { keyPath: "id" });
        }
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: "seq", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
      // Fotos tiradas offline ficam aqui até o upload para o Storage.
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetAll<T>(store: string): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  return promisify(tx.objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function idbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  return promisify(tx.objectStore(store).get(key) as IDBRequest<T | undefined>);
}

export async function idbPut<T>(store: string, value: T): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value);
  await txDone(tx);
}

export async function idbPutMany<T>(store: string, values: T[]): Promise<void> {
  if (values.length === 0) return;
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  const os = tx.objectStore(store);
  for (const value of values) os.put(value);
  await txDone(tx);
}

export async function idbDelete(store: string, key: IDBValidKey): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).delete(key);
  await txDone(tx);
}

export async function idbClear(store: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).clear();
  await txDone(tx);
}

export async function idbAdd<T>(store: string, value: T): Promise<IDBValidKey> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  const key = await promisify(tx.objectStore(store).add(value) as IDBRequest<IDBValidKey>);
  await txDone(tx);
  return key;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Apaga tudo — usado no logout, para não deixar dados de uma conta
// acessíveis a quem usar o mesmo aparelho depois.
export async function wipeOfflineDb(): Promise<void> {
  dbPromise = null;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}
