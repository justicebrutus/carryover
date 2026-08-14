// Hand-rolled, zero-dependency service worker for Carryover.
//
// Strategy (this is the important part):
//   • Navigations / HTML  → NETWORK-FIRST, fall back to the cached shell offline.
//   • Hashed build assets → CACHE-FIRST (their file names change every build, so a
//                           cached copy is always for the exact code that asked
//                           for it — safe to keep forever).
//
// The previous version was cache-first for *everything* with a fixed cache name,
// so once a build was cached it was served forever and a new deploy was never
// picked up — a stale or partially-cached shell could then white-screen. Bumping
// VERSION here makes `activate` delete every older cache, so an out-of-date client
// self-heals on its next visit. Bump VERSION whenever the shell needs to reset.
const VERSION = "v2";
const CACHE = "carryover-" + VERSION;
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Discover the hashed build assets from index.html so the very first visit is
    // fully offline-capable (their names are unknown until build time).
    try {
      const html = await (await fetch("/index.html", { cache: "no-cache" })).text();
      const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map((m) => m[1]))];
      if (assets.length) await cache.addAll(assets);
    } catch (_) { /* assets will be cached on demand instead */ }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // App shell (any navigation) → network-first. Always take a fresh index.html when
  // online so a redeploy is picked up immediately; fall back to cache when offline.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put("/index.html", fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match("/index.html")) || (await caches.match("/")) || Response.error();
      }
    })());
    return;
  }

  // Hashed assets and other GETs → cache-first, then network (and cache the result).
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) =>
      cached ||
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => Response.error()),
    ),
  );
});
