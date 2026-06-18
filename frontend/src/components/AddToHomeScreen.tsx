'use client';

import { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'desktop';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  // iPadOS 13+ маскируется под Mac — отличаем по тач-поинтам
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    ((navigator as any).platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

interface AddToHomeScreenProps {
  /** Подпись на кнопке */
  label?: string;
}

/**
 * Кнопка с инструкцией «Добавить на экран». Намеренно НЕ использует
 * beforeinstallprompt — он установил бы PWA на start_url (лендинг), а нам нужен
 * ярлык на ТЕКУЩУЮ страницу. Ручное «На экран „Домой"» в iOS создаёт иконку
 * именно на открытый URL.
 */
export function AddToHomeScreen({ label = 'Добавить на экран телефона' }: AddToHomeScreenProps) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setStandalone(isStandalone());
  }, []);

  // Внутри уже установленного ярлыка кнопка не нужна
  if (standalone) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-indigo-700 shadow-lg ring-1 ring-indigo-100 backdrop-blur transition hover:bg-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
        </svg>
        {label}
      </button>

      {open && (
        <Instructions platform={platform} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function Instructions({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-900">Сохранить страницу на экран</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Закрыть">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Иконка откроет именно эту памятную страницу одним касанием — без поиска и ввода адреса.
        </p>

        {platform === 'ios' && (
          <ol className="space-y-3 text-sm text-gray-700">
            <Step n={1}>
              Нажмите кнопку <b>«Поделиться»</b>{' '}
              <span className="inline-flex items-center align-middle">
                <svg className="mx-0.5 h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </span>{' '}
              внизу экрана Safari.
            </Step>
            <Step n={2}>
              Выберите <b>«На экран „Домой"»</b> (<i>Add to Home Screen</i>).
            </Step>
            <Step n={3}>
              Нажмите <b>«Добавить»</b> — иконка появится на рабочем столе.
            </Step>
          </ol>
        )}

        {platform === 'android' && (
          <ol className="space-y-3 text-sm text-gray-700">
            <Step n={1}>
              Откройте меню браузера <b>⋮</b> (три точки вверху справа).
            </Step>
            <Step n={2}>
              Выберите <b>«Добавить на главный экран»</b>.
            </Step>
            <Step n={3}>
              Подтвердите <b>«Добавить»</b> — ярлык появится на экране.
            </Step>
          </ol>
        )}

        {platform === 'desktop' && (
          <ol className="space-y-3 text-sm text-gray-700">
            <Step n={1}>
              Откройте эту страницу в браузере на телефоне.
            </Step>
            <Step n={2}>
              На iPhone: «Поделиться» → «На экран „Домой"». На Android: меню ⋮ → «Добавить на главный экран».
            </Step>
            <Step n={3}>
              Можно также нажать значок установки в адресной строке браузера на компьютере.
            </Step>
          </ol>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

export default AddToHomeScreen;
