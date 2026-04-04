'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModerationStats {
  pendingMemorialPages: number;
  pendingTributes: number;
  pendingMemories: number;
  totalModerated: number;
}

interface ModerationItem {
  id: string;
  contentType: 'memorial_page' | 'tribute' | 'memory';
  contentId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  moderatedAt?: string;
  moderatorId?: string;
  reason?: string;
  content?: any;
}

interface ModerationQueue {
  items: ModerationItem[];
  total: number;
  totalPages: number;
}

export default function ModerationPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [queue, setQueue] = useState<ModerationQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{
    contentType?: string;
    status: string;
    page: number;
  }>({
    status: 'pending',
    page: 1
  });

  // Загрузка статистики
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/moderation/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.data);
      } else {
        console.error('Stats error:', data);
        setError(data.message || 'Ошибка загрузки статистики');
        
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Ошибка подключения к серверу');
    }
  };

  // Загрузка очереди модерации
  const loadQueue = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const params = new URLSearchParams({
        status: currentFilter.status,
        page: currentFilter.page.toString(),
        limit: '20'
      });

      if (currentFilter.contentType) {
        params.append('contentType', currentFilter.contentType);
      }

      const response = await fetch(`/api/admin/moderation/queue?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQueue(data.data);
      } else {
        console.error('Queue error:', data);
        setError(data.message || 'Ошибка загрузки очереди модерации');
        
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      }
    } catch (err) {
      console.error('Error loading queue:', err);
      setError('Ошибка подключения к серверу');
    }
  };

  // Одобрить контент
  const approveContent = async (moderationId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/moderation/${moderationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Перезагружаем данные
        await Promise.all([loadStats(), loadQueue()]);
      } else {
        setError(data.message || 'Ошибка одобрения контента');
      }
    } catch (err) {
      console.error('Error approving content:', err);
      setError('Ошибка подключения к серверу');
    }
  };

  // Отклонить контент
  const rejectContent = async (moderationId: string, reason: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/moderation/${moderationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Перезагружаем данные
        await Promise.all([loadStats(), loadQueue()]);
      } else {
        setError(data.message || 'Ошибка отклонения контента');
      }
    } catch (err) {
      console.error('Error rejecting content:', err);
      setError('Ошибка подключения к серверу');
    }
  };

  // Массовое одобрение
  const bulkApprove = async () => {
    if (selectedItems.length === 0) return;

    const reason = prompt('Причина одобрения (необязательно):');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/moderation/bulk/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          moderationIds: selectedItems,
          reason 
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка массового одобрения');
      }

      setSelectedItems([]);
      await Promise.all([loadStats(), loadQueue()]);
    } catch (err) {
      console.error('Error bulk approving:', err);
      setError('Ошибка массового одобрения');
    }
  };

  // Массовое отклонение
  const bulkReject = async () => {
    if (selectedItems.length === 0) return;

    const reason = prompt('Причина отклонения (обязательно):');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/moderation/bulk/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          moderationIds: selectedItems,
          reason 
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка массового отклонения');
      }

      setSelectedItems([]);
      await Promise.all([loadStats(), loadQueue()]);
    } catch (err) {
      console.error('Error bulk rejecting:', err);
      setError('Ошибка массового отклонения');
    }
  };

  // Получить название типа контента
  const getContentTypeName = (type: string) => {
    switch (type) {
      case 'memorial_page': return 'Памятная страница';
      case 'tribute': return 'Отзыв';
      case 'memory': return 'Воспоминание';
      default: return type;
    }
  };

  // Получить статус на русском
  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'approved': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      default: return status;
    }
  };

  // Рендер содержимого элемента
  const renderContent = (item: ModerationItem) => {
    if (!item.content) return null;

    switch (item.contentType) {
      case 'memorial_page':
        return (
          <div>
            <h4 className="font-semibold">{item.content.fullName}</h4>
            <p className="text-sm text-gray-600">Владелец: {item.content.owner.name} ({item.content.owner.email})</p>
            {item.content.biographyText && (
              <p className="text-sm mt-2">{item.content.biographyText.substring(0, 200)}...</p>
            )}
          </div>
        );
      case 'tribute':
        return (
          <div>
            <h4 className="font-semibold">Отзыв от {item.content.authorName}</h4>
            <p className="text-sm text-gray-600">Страница: {item.content.memorialPage.fullName}</p>
            <p className="text-sm mt-2">{item.content.text.substring(0, 200)}...</p>
          </div>
        );
      case 'memory':
        return (
          <div>
            <h4 className="font-semibold">{item.content.title}</h4>
            <p className="text-sm text-gray-600">Страница: {item.content.memorialPage.fullName}</p>
            {item.content.description && (
              <p className="text-sm mt-2">{item.content.description.substring(0, 200)}...</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadQueue()]);
      setLoading(false);
    };

    loadData();
  }, [currentFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Модерация контента</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Памятные страницы</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingMemorialPages}</p>
            <p className="text-sm text-gray-600">ожидают модерации</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Отзывы</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingTributes}</p>
            <p className="text-sm text-gray-600">ожидают модерации</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Воспоминания</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingMemories}</p>
            <p className="text-sm text-gray-600">ожидают модерации</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Всего обработано</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalModerated}</p>
            <p className="text-sm text-gray-600">элементов</p>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <select
            value={currentFilter.status}
            onChange={(e) => setCurrentFilter({ ...currentFilter, status: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="pending">Ожидают модерации</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>

          <select
            value={currentFilter.contentType || ''}
            onChange={(e) => setCurrentFilter({ 
              ...currentFilter, 
              contentType: e.target.value || undefined, 
              page: 1 
            })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Все типы</option>
            <option value="memorial_page">Памятные страницы</option>
            <option value="tribute">Отзывы</option>
            <option value="memory">Воспоминания</option>
          </select>
        </div>
      </div>

      {/* Массовые действия */}
      {selectedItems.length > 0 && currentFilter.status === 'pending' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">Выбрано элементов: {selectedItems.length}</p>
          <div className="flex gap-2">
            <button
              onClick={bulkApprove}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Одобрить выбранные
            </button>
            <button
              onClick={bulkReject}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Отклонить выбранные
            </button>
          </div>
        </div>
      )}

      {/* Очередь модерации */}
      {queue && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Очередь модерации ({queue.total} элементов)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {queue.items.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {currentFilter.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getContentTypeName(item.contentType)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getStatusName(item.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {renderContent(item)}
                      {item.reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Причина:</strong> {item.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveContent(item.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Причина отклонения:');
                          if (reason) rejectContent(item.id, reason);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {queue.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentFilter({ ...currentFilter, page: currentFilter.page - 1 })}
                  disabled={currentFilter.page === 1}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                >
                  Предыдущая
                </button>
                <span className="text-sm text-gray-700">
                  Страница {currentFilter.page} из {queue.totalPages}
                </span>
                <button
                  onClick={() => setCurrentFilter({ ...currentFilter, page: currentFilter.page + 1 })}
                  disabled={currentFilter.page === queue.totalPages}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                >
                  Следующая
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}