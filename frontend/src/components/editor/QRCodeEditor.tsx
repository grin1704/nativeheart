'use client';

import { MemorialQRCode } from '../memorial/MemorialQRCode';
import type { MemorialPage, User } from '@/types';

interface QRCodeEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

export default function QRCodeEditor({ memorialPage }: QRCodeEditorProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">QR-код страницы</h2>
        <p className="text-sm text-gray-600">
          QR-код автоматически генерируется для вашей страницы. Вы можете скачать его и разместить на памятнике.
        </p>
      </div>

      {memorialPage.qrCodeUrl ? (
        <MemorialQRCode 
          memorialPageId={memorialPage.id}
          qrCodeUrl={memorialPage.qrCodeUrl}
          pageUrl={`${window.location.origin}/memorial/${memorialPage.slug}`}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-200 mb-4">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">QR-код недоступен</h3>
          <p className="text-gray-600">
            QR-код будет автоматически создан после сохранения страницы.
          </p>
        </div>
      )}
    </div>
  );
}
