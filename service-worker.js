const CACHE_VERSION = 'profies-pwa-v1';
const CACHE_PREFIX = 'profies-pwa-';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './vendor/phaser.min.js',
  './js/pwa.js',
  './js/main.js',
  './js/data/game-state.js',
  './js/services/save-service.js',
  './js/services/retro-audio.js',
  './js/services/music-service.js',
  './js/scenes/boot-scene.js',
  './js/scenes/intro-scene.js',
  './js/scenes/name-scene.js',
  './js/scenes/map-scene.js',
  './js/scenes/battle-scene.js',
  './js/scenes/outcome-scene.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/mapa/campus-definitivo-v1.png',
  './assets/batallas/biblioteca-matematicas.png',
  './assets/batallas/laboratorio-programacion.png',
  './assets/batallas/oficina-coordinacion.png',
  './assets/personajes/vigilante.png',
  './assets/personajes/avatar-masculino.png',
  './assets/personajes/avatar-femenino.png',
  './assets/personajes/avatar-masculino-movimiento.png',
  './assets/personajes/avatar-femenino-movimiento.png',
  './assets/personajes/estudiante-proyecto.png',
  './assets/personajes/encargada-cafeteria.png',
  './assets/personajes/estudiante-triste.png',
  './assets/personajes/profie-matematicas.png',
  './assets/personajes/profie-programacion.png',
  './assets/personajes/profie-coordinador.png',
  './assets/sprites/items-final.png',
  './assets/questions/matematicas.json',
  './assets/questions/programacion.json',
  './assets/questions/industrial.json',
  './assets/questions/sistemas.json',
  './assets/questions/laboral.json',
  './assets/audio/musica/exploracion-overworld.mp3',
  './assets/audio/musica/batalla-matematicas.ogg',
  './assets/audio/musica/batalla-programacion.ogg',
  './assets/audio/musica/batalla-coordinador.ogg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function respondToRangeRequest(request) {
  const cachedResponse = await caches.match(request.url);
  if (!cachedResponse) return fetch(request);

  const range = request.headers.get('range');
  const match = /bytes=(\d+)-(\d*)/.exec(range || '');
  if (!match) return cachedResponse;

  const data = await cachedResponse.arrayBuffer();
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : data.byteLength - 1;
  const end = Math.min(requestedEnd, data.byteLength - 1);

  if (start >= data.byteLength || start > end) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${data.byteLength}` }
    });
  }

  const chunk = data.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${data.byteLength}`,
      'Content-Length': String(chunk.byteLength),
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'application/octet-stream'
    }
  });
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await caches.match(request)) || caches.match('./index.html');
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  if (response.ok && new URL(request.url).origin === self.location.origin) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.headers.has('range')) {
    event.respondWith(respondToRangeRequest(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
