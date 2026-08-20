// Service worker do CampoAgri — modo offline de leitura.
//
// Estratégias:
// - Assets estáticos do Next (/_next/static, ícones): cache-first (URLs com hash, imutáveis).
// - Navegações e payloads RSC: network-first com timeout; cai para a cópia em
//   cache da mesma URL (páginas já visitadas funcionam offline, somente leitura)
//   e, por fim, para a página /offline.
// - Fotos do Supabase Storage: cache-first com limite de entradas.
// - Nada de POST/ações: criar/editar exige conexão (o formulário mostra erro).

const VERSION = "v2";
const SHELL_CACHE = `campoagri-shell-${VERSION}`;
const PAGES_CACHE = `campoagri-pages-${VERSION}`;
const ASSETS_CACHE = `campoagri-assets-${VERSION}`;
const IMAGES_CACHE = `campoagri-images-${VERSION}`;
const ALL_CACHES = [SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE, IMAGES_CACHE];

const OFFLINE_URL = "/offline";
const SHELL_ASSETS = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

const NETWORK_TIMEOUT_MS = 6000;
const MAX_IMAGE_ENTRIES = 200;
const MAX_PAGE_ENTRIES = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
}

async function cachePut(cacheName, request, response, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    if (maxEntries) await trimCache(cacheName, maxEntries);
  } catch {
    // Cache cheio ou indisponível: segue sem cachear.
  }
}

// Network-first: tenta rede (com timeout), guarda cópia e cai para o cache.
async function networkFirst(event, cacheName, { fallbackToOffline = false, maxEntries } = {}) {
  try {
    const response = await fetchWithTimeout(event.request, NETWORK_TIMEOUT_MS);
    if (response && response.ok) {
      event.waitUntil(cachePut(cacheName, event.request, response.clone(), maxEntries));
    }
    return response;
  } catch {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (fallbackToOffline) {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    return Response.error();
  }
}

// Cache-first: serve do cache e busca na rede apenas se faltar.
async function cacheFirst(event, cacheName, { maxEntries } = {}) {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (response && (response.ok || response.type === "opaque")) {
    event.waitUntil(cachePut(cacheName, event.request, response.clone(), maxEntries));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Fotos e arquivos do Supabase Storage
  if (url.pathname.includes("/storage/v1/object")) {
    event.respondWith(cacheFirst(event, IMAGES_CACHE, { maxEntries: MAX_IMAGE_ENTRIES }));
    return;
  }

  // Demais requisições cross-origin (ex.: API do Supabase): não intercepta.
  if (url.origin !== self.location.origin) return;

  // Assets imutáveis do build + ícones
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(event, ASSETS_CACHE));
    return;
  }

  // Navegações de página
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(event, PAGES_CACHE, { fallbackToOffline: true, maxEntries: MAX_PAGE_ENTRIES })
    );
    return;
  }

  // Payloads RSC das navegações client-side do Next
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") {
    event.respondWith(networkFirst(event, PAGES_CACHE, { maxEntries: MAX_PAGE_ENTRIES }));
    return;
  }

  // Outros GETs same-origin (manifest etc.)
  event.respondWith(networkFirst(event, SHELL_CACHE));
});
