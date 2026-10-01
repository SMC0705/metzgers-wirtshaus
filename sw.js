// Bei Änderungen an den Dateien die Versionsnummer hochzählen.
const VERSION = "mwa-v3";
const DATEIEN = ["./", "index.html", "admin.html", "style.css", "konfig.js", "gemeinsam.js",
  "manifest-gast.json", "manifest-admin.json", "icon-192.png", "icon-512.png", "icon-admin-192.png", "icon-admin-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
// Immer zuerst aus dem Netz holen, nur ohne Empfang aus dem Speicher.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && !url.pathname.endsWith("data.json")) { const kopie = r.clone(); caches.open(VERSION).then(c => c.put(e.request, kopie)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
