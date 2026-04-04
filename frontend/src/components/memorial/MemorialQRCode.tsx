'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';

interface QRCodeData {
  qrCodeUrl: string;
  pageUrl: string;
}

interface QRCodeAPIResponse {
  url: string;
  dataUrl: string;
  format: string;
  size: number;
}

interface MemorialQRCodeProps {
  memorialPageId: string;
  qrCodeUrl?: string;
  pageUrl?: string;
}

export const MemorialQRCode: React.FC<MemorialQRCodeProps> = ({ 
  memorialPageId, 
  qrCodeUrl: providedQrCodeUrl,
  pageUrl: providedPageUrl 
}) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);

        // If QR code URL is provided directly, use it as the page URL
        if (providedQrCodeUrl) {
          // providedQrCodeUrl is actually the page URL (e.g., http://localhost:3000/memorial/slug)
          // Generate QR code image URL using a public QR code API
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(providedQrCodeUrl)}`;
          
          setQrData({
            qrCodeUrl: qrImageUrl,  // URL изображения QR-кода
            pageUrl: providedQrCodeUrl  // URL страницы
          });
          setLoading(false);
          return;
        }

        // If page URL is provided, use it
        if (providedPageUrl) {
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(providedPageUrl)}`;
          
          setQrData({
            qrCodeUrl: qrImageUrl,
            pageUrl: providedPageUrl
          });
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API
        const response = await apiRequest<QRCodeAPIResponse>(
          'GET',
          `/qr-code/${memorialPageId}`
        );

        if (response.success && response.data) {
          // API returns: { url: pageUrl, dataUrl: base64Image, format, size }
          // Convert to our internal format
          setQrData({
            qrCodeUrl: response.data.dataUrl,  // base64 image
            pageUrl: response.data.url  // page URL
          });
        } else {
          setError('QR-код не найден');
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('Ошибка загрузки QR-кода');
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [memorialPageId, providedQrCodeUrl, providedPageUrl]);

  const downloadQRCode = async (format: 'png' | 'svg' | 'pdf' = 'png') => {
    try {
      setDownloading(true);
      
      if (!qrData?.pageUrl) {
        setError('URL страницы не найден');
        return;
      }

      // Generate QR code download URL based on format
      let downloadUrl: string;
      
      if (format === 'svg') {
        // SVG format
        downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=svg&data=${encodeURIComponent(qrData.pageUrl)}`;
      } else if (format === 'pdf') {
        // For PDF, we'll download PNG and let user convert or use a different approach
        // For now, download high-res PNG
        downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=2000x2000&data=${encodeURIComponent(qrData.pageUrl)}`;
      } else {
        // PNG format (default)
        downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData.pageUrl)}`;
      }

      // Fetch the QR code image
      const response = await fetch(downloadUrl);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memorial-qr-code.${format === 'pdf' ? 'png' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Ошибка скачивания QR-кода');
      }
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Ошибка скачивания QR-кода');
    } finally {
      setDownloading(false);
    }
  };

  const copyPageUrl = async () => {
    if (qrData?.pageUrl) {
      try {
        await navigator.clipboard.writeText(qrData.pageUrl);
        // Could add a toast notification here
        alert('Ссылка скопирована в буфер обмена');
      } catch (err) {
        console.error('Error copying URL:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = qrData.pageUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Ссылка скопирована в буфер обмена');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mx-auto w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">QR-код недоступен</h3>
        <p className="text-muted-foreground">QR-код для этой страницы пока не создан.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">QR-код страницы</h2>
      
      <div className="text-center">
        {/* QR Code Image */}
        <div className="inline-block bg-background p-4 rounded-lg shadow-sm border border-border mb-6">
          <img
            src={qrData.qrCodeUrl}
            alt="QR-код памятной страницы"
            className="w-48 h-48 mx-auto"
          />
        </div>

        {/* Page URL */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Ссылка на страницу</h3>
          <div className="flex items-center justify-center space-x-2">
            <input
              type="text"
              value={qrData.pageUrl}
              readOnly
              className="flex-1 max-w-md px-3 py-2 border border-input rounded-md bg-muted text-sm text-foreground"
            />
            <button
              onClick={copyPageUrl}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm"
              title="Скопировать ссылку"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Скачать QR-код</h3>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => downloadQRCode('png')}
              disabled={downloading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloading ? 'Скачивание...' : 'PNG'}
            </button>
            
            <button
              onClick={() => downloadQRCode('svg')}
              disabled={downloading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloading ? 'Скачивание...' : 'SVG'}
            </button>
            
            <button
              onClick={() => downloadQRCode('pdf')}
              disabled={downloading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloading ? 'Скачивание...' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-primary/5 rounded-lg p-6 text-left border border-primary/20">
          <h4 className="text-lg font-semibold text-primary mb-3">Как использовать QR-код</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
              <span>Распечатайте QR-код и разместите на памятнике или надгробии</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
              <span>Посетители смогут отсканировать код камерой телефона</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
              <span>Код автоматически откроет памятную страницу в браузере</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
              <span>Поделитесь ссылкой с родственниками и друзьями</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemorialQRCode;