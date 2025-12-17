// Service Worker para AgroCultive PWA
const CACHE_NAME = 'agrocultive-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './app.js',
  './database.js',
  './calculos.js',
  './culturas-db.js',
  './navigation.js',
  './ui-dashboard.js',
  './ui-crm.js',
  './ui-coleta-campo.js',
  './ui-analise.js',
  './ui-recomendacao.js',
  './gps.js',
  './logosemfundo.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Erro ao fazer cache:', err);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível, senão buscar na rede
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback para página offline se disponível
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

