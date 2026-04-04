'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import type { MemorialPage, User } from '@/types';

interface Tribute {
  id: string;
  memorialPageId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  photo?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    originalName: string;
  };
  isApproved: boolean;
  createdAt: Date;
}

interface TributesEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

export default function TributesEditor({ memorialPage, user, onUpdate, onError }: TributesEditorProps) {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  // Check access based on API response, not user subscription
  const isPremiumFeature = !hasAccess && subscriptionRequired;

  useEffect(() => {
    loadTributes();
  }, [memorialPage.id]);

  const loadTributes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<any>('GET', `/memorial-pages/${memorialPage.id}/tributes`);
      if (response.success) {
        setTributes(response.data || []);
        setHasAccess(true);
        setSubscriptionRequired(false);
      } else if (response.error && response.error.includes('доступен только в платной версии')) {
        setHasAccess(false);
        setSubscriptionRequired(true);
        setTributes([]);
      }
    } catch (err) {
      console.error('Error loading tributes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tributeId: string) => {
    try {
      const response = await apiRequest('PUT', `/tributes/${tributeId}/moderate`, {
        isApproved: true
      });
      if (response.success) {
        setTributes(prev => prev.map(t => 
          t.id === tributeId ? { ...t, isApproved: true } : t
        ));
      } else {
        onError(response.error || 'Ошибка одобрения отзыва');
      }
    } catch (err) {
      onError('Ошибка одобрения отзыва');
    }
  };

  const handleReject = async (tributeId: string) => {
    try {
      const response = await apiRequest('PUT', `/tributes/${tributeId}/moderate`, {
        isApproved: false
      });
      if (response.success) {
        setTributes(prev => prev.map(t => 
          t.id === tributeId ? { ...t, isApproved: false } : t
        ));
      } else {
        onError(response.error || 'Ошибка отклонения отзыва');
      }
    } catch (err) {
      onError('Ошибка отклонения отзыва');
    }
  };

  const handleDelete = async (tributeId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      const response = await apiRequest('DELETE', `/tributes/${tributeId}`);
      if (response.success) {
        setTributes(prev => prev.filter(t => t.id !== tributeId));
      } else {
        onError(response.error || 'Ошибка удаления отзыва');
      }
    } catch (err) {
      onError('Ошибка удаления отзыва');
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isPremiumFeature) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Премиум функция</h3>
          <p className="mt-1 text-sm text-gray-500">
            Раздел отзывов доступен только в премиум версии.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Обновить подписку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Слова близких</h2>
        <p className="text-sm text-gray-600">
          Управляйте отзывами и словами близких людей. Вы можете одобрять, отклонять или удалять отзывы.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      ) : tributes.length > 0 ? (
        <div className="space-y-4">
          {tributes.map((tribute) => (
            <div key={tribute.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {tribute.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {tribute.authorName}
                      </h4>
                      {tribute.authorEmail && (
                        <span className="text-xs text-gray-500">
                          ({tribute.authorEmail})
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tribute.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tribute.isApproved ? 'Одобрен' : 'На модерации'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {formatDate(tribute.createdAt)}
                    </p>
                    
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">
                      {tribute.text}
                    </p>
                    
                    {tribute.photo && (
                      <div className="mt-3">
                        <img
                          src={tribute.photo.thumbnailUrl || tribute.photo.url}
                          alt="Фото к отзыву"
                          className="max-w-xs h-32 object-cover rounded-md shadow-sm cursor-pointer"
                          onClick={() => window.open(tribute.photo!.url, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!tribute.isApproved && (
                    <button
                      onClick={() => handleApprove(tribute.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                      title="Одобрить отзыв"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  
                  {tribute.isApproved && (
                    <button
                      onClick={() => handleReject(tribute.id)}
                      className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded"
                      title="Отклонить отзыв"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(tribute.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Удалить отзыв"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Нет отзывов</h3>
          <p className="mt-1 text-sm text-gray-500">
            Отзывы от посетителей будут отображаться здесь.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Информация</h4>
        <p className="text-sm text-blue-800">
          Посетители могут оставлять отзывы на публичной странице. Все отзывы автоматически одобряются, 
          но вы можете управлять ими здесь - одобрять, отклонять или удалять.
        </p>
      </div>
    </div>
  );
}