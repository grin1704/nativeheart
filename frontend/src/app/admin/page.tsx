'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    trial: number;
    free: number;
    premium: number;
    newThisMonth: number;
  };
  memorialPages: {
    total: number;
    published: number;
    private: number;
    newThisMonth: number;
  };
  content: {
    totalMemories: number;
    totalTributes: number;
    pendingTributes: number;
    totalMediaFiles: number;
    storageUsed: number;
  };
  activity: {
    loginsToday: number;
    pagesCreatedToday: number;
    tributesSubmittedToday: number;
  };
}

interface RecentActivity {
  recentPages: Array<{
    id: string;
    fullName: string;
    slug: string;
    owner: string;
    createdAt: string;
  }>;
  recentTributes: Array<{
    id: string;
    authorName: string;
    memorialPageName: string;
    memorialPageSlug: string;
    isApproved: boolean;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    subscriptionType: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Не авторизован. Пожалуйста, войдите в систему.');
        window.location.href = '/admin/login';
        return;
      }
      
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/dashboard/activity', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

      if (statsResponse.ok && statsData.success) {
        setStats(statsData.data);
      } else {
        console.error('Stats error:', statsData);
        setError(statsData.message || 'Ошибка загрузки статистики');
        
        if (statsResponse.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      }

      if (activityResponse.ok && activityData.success) {
        setActivity(activityData.data);
      } else {
        console.error('Activity error:', activityData);
        // Don't set error for activity, just log it
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600">Обзор системы памятных страниц</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Пользователи</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего:</span>
                <span className="font-medium">{stats.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Пробный период:</span>
                <span className="font-medium">{stats.users.trial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Бесплатные:</span>
                <span className="font-medium">{stats.users.free}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Премиум:</span>
                <span className="font-medium">{stats.users.premium}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Новых за месяц:</span>
                <span className="font-medium">+{stats.users.newThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Memorial Pages Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Памятные страницы</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего:</span>
                <span className="font-medium">{stats.memorialPages.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Публичные:</span>
                <span className="font-medium">{stats.memorialPages.published}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Приватные:</span>
                <span className="font-medium">{stats.memorialPages.private}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Новых за месяц:</span>
                <span className="font-medium">+{stats.memorialPages.newThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Контент</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Воспоминания:</span>
                <span className="font-medium">{stats.content.totalMemories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Отзывы:</span>
                <span className="font-medium">{stats.content.totalTributes}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span className="text-sm">На модерации:</span>
                <span className="font-medium">{stats.content.pendingTributes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Медиафайлы:</span>
                <span className="font-medium">{stats.content.totalMediaFiles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Хранилище:</span>
                <span className="font-medium">{formatBytes(stats.content.storageUsed)}</span>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Активность сегодня</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Создано страниц:</span>
                <span className="font-medium">{stats.activity.pagesCreatedToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Новых отзывов:</span>
                <span className="font-medium">{stats.activity.tributesSubmittedToday}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Pages */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Последние страницы</h3>
            <div className="space-y-3">
              {activity.recentPages.slice(0, 5).map((page) => (
                <div key={page.id} className="border-b border-gray-200 pb-2">
                  <div className="font-medium text-sm">{page.fullName}</div>
                  <div className="text-xs text-gray-600">
                    Создал: {page.owner}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(page.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tributes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Последние отзывы</h3>
            <div className="space-y-3">
              {activity.recentTributes.slice(0, 5).map((tribute) => (
                <div key={tribute.id} className="border-b border-gray-200 pb-2">
                  <div className="font-medium text-sm">{tribute.authorName}</div>
                  <div className="text-xs text-gray-600">
                    К странице: {tribute.memorialPageName}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {formatDate(tribute.createdAt)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      tribute.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tribute.isApproved ? 'Одобрен' : 'На модерации'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Новые пользователи</h3>
            <div className="space-y-3">
              {activity.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="border-b border-gray-200 pb-2">
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.subscriptionType === 'premium' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.subscriptionType === 'trial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscriptionType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}