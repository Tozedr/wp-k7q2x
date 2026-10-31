// Offline cache for the prototype: app shell only, answers live in localStorage.
// The page itself is network-first, so a new deploy shows up on the next open; the cache is the offline fallback.
const CACHE = "wp-profile-core-v11";
const FONTS = ["CormorantGaramond-normal-cyrillic", "CormorantGaramond-normal-latin", "CormorantGaramond-italic-cyrillic", "CormorantGaramond-italic-latin", "GolosText-normal-cyrillic", "GolosText-normal-latin"];
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "fonts/fonts.css", ...FONTS.map(f => `fonts/${f}.woff2`)];
self.addEventListener("install", e => {
  self.skipWaiting();   // do not wait for old tabs to close
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))));
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === "navigate" || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (isPage) {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./", copy)); }
      return r;
    }).catch(() => caches.match("./", {ignoreSearch: true})));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
