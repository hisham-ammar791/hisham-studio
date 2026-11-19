// Offline cache for استوديو الإخراج الذكي.
// - The app files are stored at install, so the app opens with no internet after the first visit.
// - The page itself (index.html) is fetched from the network first, so a new upload appears at once;
//   if the network is missing or slower than 4 seconds, the stored copy opens instead.
// - Icons, fonts and other files are served from the cache and refreshed in the background.
const CACHE = 'hisham-studio-v16';
const FILES = ['./', 'index.html', 'studio.html', 'song-fix.html', 'song.html', 'ad.html', 'film.html', 'doc.html', 'core.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
  'apple-touch-icon.png', 'fonts/cairo-arabic.woff2', 'fonts/cairo-latin.woff2', 'fonts/cairo-latin-ext.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const offline = () => new Response('غير متصل بالإنترنت', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // AI, translation & Google go to the network
  const pn = new URL(req.url).pathname;
  const isPage = req.mode === 'navigate' || /\/(index\.html|studio\.html|song-fix\.html|song\.html|ad\.html|film\.html|doc\.html|core\.js)?$/.test(pn);
  const pageKey = /\/$/.test(pn) ? 'index.html' : pn.split('/').pop();

  if (isPage) {
    e.respondWith(caches.open(CACHE).then(async cache => {
      const net = fetch(req, { cache: 'no-store' }).then(res => {
        if (res && res.ok) cache.put(pageKey, res.clone());
        return res;
      });
      const timeout = new Promise(r => setTimeout(r, 4000, null));
      const res = await Promise.race([net.catch(() => null), timeout]);
      if (res && res.ok) return res;
      const hit = await cache.match(pageKey);
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return (await net.catch(() => null)) || offline();
    }));
    return;
  }

  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || offline();
  }));
});
