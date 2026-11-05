// 파일을 수정해서 다시 올릴 때마다 아래 버전 숫자를 올리세요 (v2 -> v3)
// 방식: 인터넷이 되면 항상 최신 파일을 받고, 오프라인이면 저장된 파일을 씁니다.
const CACHE = 'haepang-v5';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // cache: 'reload' = 브라우저 임시저장본이 아니라 서버의 최신 파일을 받음
      Promise.all(FILES.map(f => fetch(new Request(f, { cache: 'reload' })).then(r => { if (r.ok) return c.put(f, r); })))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request.url, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request.url).then(r => r || caches.match('./index.html')))
  );
});
