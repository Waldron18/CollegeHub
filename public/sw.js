const CACHE_NAME = 'collegehub-v1';
const DYNAMIC_CACHE = 'collegehub-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/profile',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CollegeHub — Offline Mode</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #F59E0B;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1E3A8A;
      margin: 0 0 8px 0;
    }
    p {
      font-size: 14px;
      color: #64748B;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .student-dossier {
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 24px;
      text-align: left;
      font-size: 12px;
    }
    .student-dossier div {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .student-dossier div:last-child {
      margin-bottom: 0;
    }
    .student-dossier span.label {
      color: #64748B;
    }
    .student-dossier span.val {
      font-weight: 600;
      color: #0F172A;
    }
    button {
      background-color: #1E3A8A;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;
      width: 100%;
    }
    button:hover {
      background-color: #1D4ED8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      Offline Mode — Cached Academic Dossier
    </div>
    <h1>CollegeHub — Offline Academic Mode</h1>
    <p>You are currently offline. You can continue viewing previously cached student profiles, timetables, and academic records.</p>
    <div class="student-dossier">
      <div><span class="label">Student Name:</span> <span class="val">Aditya Sharma</span></div>
      <div><span class="label">PRN:</span> <span class="val">22110482</span></div>
      <div><span class="label">Program:</span> <span class="val">B.Tech Computer Engineering</span></div>
      <div><span class="label">Status:</span> <span class="val" style="color:#0D9488;">Cached Profile Active</span></div>
    </div>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>`;

// Install Event: pre-cache critical app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: purge stale caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Explicitly bypass Next.js internal chunks, build artifacts, and development hot-reloading endpoints
  if (event.request.url.includes('/_next/')) {
    return;
  }

  // Only handle HTTP/HTTPS GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Never cache SSE realtime stream or API websocket-like endpoints
  if (url.pathname.startsWith('/api/realtime') || event.request.headers.get('accept')?.includes('text/event-stream')) {
    return;
  }

  // 1. Navigation / HTML Document requests: Network-First with Cache fallback and Offline fallback
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          // Try matching requested URL in cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Try fallback cached dashboard
          const cachedDashboard = await caches.match('/dashboard');
          if (cachedDashboard) {
            return cachedDashboard;
          }
          // Return offline fallback HTML
          return new Response(OFFLINE_FALLBACK_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // 2. Static Assets (_next/static, icons, images): Cache-First with Network fallback
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. All other GET requests (API endpoints, general assets): Network-First with Cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        return new Response(JSON.stringify({ error: 'Network unavailable (offline)' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
  );
});
