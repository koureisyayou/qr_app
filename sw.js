// ★ ファイルを修正したら、この番号を必ず1つ上げてください
const CACHE_NAME = 'barcode-yomu-v1.0.7';

// オフラインでもスマホ内に保存しておくファイルのリスト
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './html5-qrcode.min.js',
  './icon-192.png',
  './icon-512.png'
];

// ① インストール時: ブラウザのHTTPキャッシュを迂回して、確実に最新版を保存する
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(
        ASSETS.map((url) => new Request(url, { cache: 'reload' }))
      ))
      .then(() => self.skipWaiting())
  );
});

// ② 有効化時: 古いキャッシュを自動で削除する
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      ))
      .then(() => self.clients.claim())
  );
});

// ③ 取得時
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // GET以外、および別サイト（Google検索など）へのアクセスには関与しない
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // HTMLはネット優先（つながらなければキャッシュ）
  // → キャッシュ番号の上げ忘れがあっても、古い画面に固定されない
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // それ以外（JS・アイコンなど）はキャッシュ優先
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
