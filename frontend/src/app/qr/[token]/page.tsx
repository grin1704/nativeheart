import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default async function QrRedirectPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  try {
    const res = await fetch(`${BACKEND_URL}/api/qr-plates/${token}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const plate = data.data;
      if (plate?.status === 'assigned' && plate?.memorialPage?.slug) {
        redirect(`/memorial/${plate.memorialPage.slug}`);
      }
    }
  } catch (e) {
    if (isRedirectError(e)) throw e; // пробрасываем редирект дальше
    // остальные ошибки — показываем заглушку
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">Страница ещё не создана</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Этот QR-код зарезервирован, но памятная страница к нему пока не привязана.
            Если вы получили эту табличку — обратитесь к тому, кто её заказал.
          </p>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-800">Перейти на главную</a>
          </div>
        </div>
      </div>
    </div>
  );
}
