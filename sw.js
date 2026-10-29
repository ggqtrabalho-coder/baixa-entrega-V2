/* Service worker: guarda o app no celular para abrir mesmo sem internet.
 * Ao publicar uma versão nova do app, aumente o número em VERSAO. */
const PREFIXO = 'baixa-entrega-';
const VERSAO = PREFIXO + 'v5.1';
const ARQUIVOS = ['./', 'index.html', 'html5-qrcode.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith(PREFIXO) && n !== VERSAO).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // chamadas ao Apps Script passam direto
  // usa a cópia guardada na hora (abre rápido e offline) e atualiza em segundo plano
  e.respondWith(caches.open(VERSAO).then(async (cache) => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const daRede = fetch(e.request).then((r) => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => guardado);
    return guardado || daRede;
  }));
});
