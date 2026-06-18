const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Документы/навигации всегда тянем из сети: иначе после релиза старый
      // service worker отдаёт устаревший app-shell со ссылками на исчезнувшие
      // JS-чанки → белый экран / «не обновляется» (на iOS лечилось только
      // перезагрузкой телефона). Кеш остаётся запасным вариантом на офлайн.
      urlPattern: ({ request, sameOrigin }) =>
        sameOrigin && request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1 день
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/storage\.yandexcloud\.net\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'yandex-cloud-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
        },
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 минут
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['storage.yandexcloud.net'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Увеличиваем лимиты для загрузки больших видео файлов
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

module.exports = withPWA(nextConfig);