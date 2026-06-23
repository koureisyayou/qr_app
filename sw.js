const CACHE_NAME = 'barcode-yomu-v1.0.4'; // バージョンを少し上げました
// 上の番号を更新毎に増やす

// オフラインでもスマホ内に保存しておくファイルのリスト
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './html5-qrcode.min.js',
  './icon-192.png',
  './icon-512.png'
];

// ① アプリがインストールされたときに、ファイルをスマホに保存する
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ② アプリが更新されたとき、古いキャッシュを自動で削除する
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// ③ インターネット通信の代わりに、スマホに保存したファイルを返す（機内モード対応）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('./');
      }
    })
  );
});
