// Offline cache for the prototype: app shell only, answers live in localStorage
const CACHE = "wp-profile-core-v8";
const FONTS = ["CormorantGaramond-normal-cyrillic", "CormorantGaramond-normal-latin", "CormorantGaramond-italic-cyrillic", "CormorantGaramond-italic-latin", "GolosText-normal-cyrillic", "GolosText-normal-latin"];
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "fonts/fonts.css", ...FONTS.map(f => `fonts/${f}.woff2`)];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
