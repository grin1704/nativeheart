import type { Metadata } from 'next';
import MemorialClient from './MemorialClient';

interface MemorialData {
  fullName: string;
  mainPhoto?: { url: string; thumbnailUrl?: string } | null;
}

// Серверный запрос данных страницы (для метаданных). На фронт-контейнере
// backend доступен по внутреннему адресу; на сборке переменной нет — тогда
// просто откатываемся на дефолтные метаданные.
async function fetchMemorial(slug: string): Promise<MemorialData | null> {
  try {
    const base = process.env.BACKEND_URL || 'http://backend:3001';
    const res = await fetch(`${base}/api/memorial-pages/slug/${slug}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const page = await fetchMemorial(params.slug);

  // Ключевой момент: manifest: null убирает наследуемый глобальный манифест
  // именно на этой странице. Иначе iOS при «На экран „Домой"» берёт start_url
  // (/dashboard) и name («Память») ИЗ МАНИФЕСТА, игнорируя текущий URL. Без
  // манифеста iOS использует URL этой страницы + apple-mobile-web-app-title +
  // apple-touch-icon — то есть имя и портрет покойного. Удаление манифеста через
  // JS в рантайме iOS игнорирует, поэтому убираем его в серверном HTML.
  if (!page) {
    return { manifest: null };
  }

  const icon = page.mainPhoto?.thumbnailUrl || page.mainPhoto?.url;

  return {
    title: `${page.fullName} — Память`,
    manifest: null,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: page.fullName,
    },
    ...(icon ? { icons: { apple: icon, icon } } : {}),
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <MemorialClient slug={params.slug} />;
}
