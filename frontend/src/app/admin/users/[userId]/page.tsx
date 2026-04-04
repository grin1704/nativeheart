'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserDetails {
  id: string;
  email: string;
  name: string;
  subscriptionType: string;
  subscriptionExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memorialPages: Array<{
    id: string;
    fullName: string;
    slug: string;
    isPrivate: boolean;
    createdAt: string;
  }>;
  statistics: {
    totalPages: number;
    totalMemories: number;
    totalTributes: number;
    storageUsed: number;
  };
}

interface UserActivity {
  recentPages: Array<{
    id: string;
    fullName: string;
    slug: string;
    createdAt: string;
  }>;
  recentMemories: Array<{
    id: string;
    title: string;
    createdAt: string;
    memorialPage: {
      fullName: string;
      slug: string;
    };
  }>;
  recentUploads: Array<{
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }>;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
      loadUserActivity();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else if (response.status === 404) {
        setError('Пользователь не найден');
      } else {
        setError('Ошибка загрузки данных пользователя');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivity = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}/activity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActivity(data.data);
      }
    } catch (error) {
      console.error('Error loading user activity:', error);
    }
  };

  const suspendUser = async (reason: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        loadUserDetails();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка блокировки пользователя');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    }
  };

  const activateUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadUserDetails();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка разблокировки пользователя');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    }
  };

  const updateSubscription = async (subscriptionType: string, expiresAt: string | null) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionType, expiresAt })
      });

      if (response.ok) {
        loadUserDetails();
        setShowSubscriptionModal(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка обновления подписки');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    }
  };

  const handleSuspendClick = () => {
    const reason = prompt('Введите причину блокировки пользователя:');
    if (reason && reason.trim().length >= 10) {
      suspendUser(reason.trim());
    } else if (reason !== null) {
      alert('Причина должна содержать минимум 10 символов');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSubscriptionBadge = (type: string) => {
    const badges = {
      trial: 'bg-blue-100 text-blue-800',
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          ← Вернуться к списку пользователей
        </Link>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-blue-600 hover:text-blue-900 text-sm mb-2 inline-block"
          >
            ← Вернуться к списку пользователей
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Изменить подписку
          </button>
          {user.isActive ? (
            <button
              onClick={handleSuspendClick}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Заблокировать
            </button>
          ) : (
            <button
              onClick={activateUser}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Разблокировать
            </button>
          )}
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Активен' : 'Заблокирован'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Подписка:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionBadge(user.subscriptionType)}`}>
                {user.subscriptionType}
              </span>
            </div>
            {user.subscriptionExpiresAt && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Истекает:</span>
                <span className="text-sm font-medium">{formatDate(user.subscriptionExpiresAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Регистрация:</span>
              <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Памятных страниц:</span>
              <span className="font-medium">{user.statistics.totalPages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Воспоминаний:</span>
              <span className="font-medium">{user.statistics.totalMemories}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Отзывов:</span>
              <span className="font-medium">{user.statistics.totalTributes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Хранилище:</span>
              <span className="font-medium">{formatBytes(user.statistics.storageUsed)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Memorial Pages */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Памятные страницы ({user.memorialPages.length})
          </h3>
        </div>
        <div className="p-6">
          {user.memorialPages.length > 0 ? (
            <div className="space-y-4">
              {user.memorialPages.map((page) => (
                <div key={page.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{page.fullName}</h4>
                      <p className="text-sm text-gray-600">/{page.slug}</p>
                      <p className="text-xs text-gray-500">Создана: {formatDate(page.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {page.isPrivate && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Приватная
                        </span>
                      )}
                      <Link
                        href={`/memorial/${page.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Просмотр
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Пользователь еще не создал памятных страниц</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {activity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Последние страницы</h3>
            </div>
            <div className="p-6">
              {activity.recentPages.length > 0 ? (
                <div className="space-y-3">
                  {activity.recentPages.slice(0, 5).map((page) => (
                    <div key={page.id} className="border-b border-gray-200 pb-2">
                      <div className="font-medium text-sm">{page.fullName}</div>
                      <div className="text-xs text-gray-500">{formatDate(page.createdAt)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Нет данных</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Последние воспоминания</h3>
            </div>
            <div className="p-6">
              {activity.recentMemories.length > 0 ? (
                <div className="space-y-3">
                  {activity.recentMemories.slice(0, 5).map((memory) => (
                    <div key={memory.id} className="border-b border-gray-200 pb-2">
                      <div className="font-medium text-sm">{memory.title}</div>
                      <div className="text-xs text-gray-600">{memory.memorialPage.fullName}</div>
                      <div className="text-xs text-gray-500">{formatDate(memory.createdAt)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Нет данных</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Последние загрузки</h3>
            </div>
            <div className="p-6">
              {activity.recentUploads.length > 0 ? (
                <div className="space-y-3">
                  {activity.recentUploads.slice(0, 5).map((upload) => (
                    <div key={upload.id} className="border-b border-gray-200 pb-2">
                      <div className="font-medium text-sm">{upload.originalName}</div>
                      <div className="text-xs text-gray-600">{formatBytes(upload.size)}</div>
                      <div className="text-xs text-gray-500">{formatDate(upload.uploadedAt)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Нет данных</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Изменить подписку
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const subscriptionType = formData.get('subscriptionType') as string;
                  const expiresAt = formData.get('expiresAt') as string;
                  updateSubscription(subscriptionType, expiresAt || null);
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип подписки
                  </label>
                  <select
                    name="subscriptionType"
                    defaultValue={user.subscriptionType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="trial">Пробный период</option>
                    <option value="free">Бесплатная</option>
                    <option value="premium">Премиум</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата истечения (опционально)
                  </label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    defaultValue={user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toISOString().slice(0, 16) : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}