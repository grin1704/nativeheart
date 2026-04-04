'use client';

import { useState } from 'react';
import { apiRequest } from '@/utils/api';
import type { ExternalVideoInfo } from '@/types';

interface ExternalVideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (videoInfo: ExternalVideoInfo & { title?: string; description?: string }) => void;
}

export default function ExternalVideoDialog({ isOpen, onClose, onAdd }: ExternalVideoDialogProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewInfo, setPreviewInfo] = useState<ExternalVideoInfo | null>(null);

  if (!isOpen) return null;

  const handleParseUrl = async () => {
    if (!url.trim()) {
      setError('Введите ссылку на видео');
      return;
    }

    setIsLoading(true);
    setError('');
    setPreviewInfo(null);

    try {
      const response = await apiRequest<ExternalVideoInfo>('POST', '/gallery/parse-video', { url: url.trim() });

      if (response.success && response.data) {
        setPreviewInfo(response.data);
        // Auto-fill title if not set
        if (!title && response.data.title) {
          setTitle(response.data.title);
        }
        if (!description && response.data.description) {
          setDescription(response.data.description);
        }
      } else {
        setError(response.error || 'Не удалось распознать ссылку на видео');
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось распознать ссылку на видео');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!previewInfo) {
      setError('Сначала проверьте ссылку');
      return;
    }

    await onAdd({
      ...previewInfo,
      title: title || previewInfo.title,
      description: description || previewInfo.description,
    });

    // Reset form
    setUrl('');
    setTitle('');
    setDescription('');
    setPreviewInfo(null);
    setError('');
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setPreviewInfo(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Добавить видео по ссылке</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на видео
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://vk.com/video... или https://rutube.ru/video/..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleParseUrl}
                  disabled={isLoading || !url.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Проверка...' : 'Проверить'}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Поддерживаются видео с ВКонтакте (vk.com, vkvideo.ru) и Rutube
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}

            {previewInfo && (
              <>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Предпросмотр</h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: previewInfo.embedCode }} />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Источник: {previewInfo.videoType === 'vk' ? 'ВКонтакте' : 'Rutube'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название (необязательно)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название видео"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание (необязательно)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Введите описание видео"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Добавить видео
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
