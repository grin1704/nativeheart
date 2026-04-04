'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SystemSettings {
  trialPeriodDays: number;
  maxFileSize: number;
  maxFilesPerPage: number;
  biographyCharLimit: number;
  allowedFileTypes: string[];
  moderationRequired: boolean;
  maintenanceMode: boolean;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  yandexCloudSettings: {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region: string;
  };
  subscriptionSettings: {
    trialDurationDays: number;
    premiumPriceMonthly: number;
    premiumPriceYearly: number;
    currency: string;
  };
}

interface SystemStatistics {
  totalUsers: number;
  activeUsers: number;
  totalMemorialPages: number;
  totalMediaFiles: number;
  storageUsed: number;
  subscriptionStats: {
    trial: number;
    free: number;
    premium: number;
  };
}

interface ConnectionStatus {
  database: boolean;
  yandexCloud: boolean;
  email: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [connections, setConnections] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const [settingsRes, statisticsRes, connectionsRes] = await Promise.all([
        fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/test/connections', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.data);
      }

      if (statisticsRes.ok) {
        const statisticsData = await statisticsRes.json();
        setStatistics(statisticsData.data);
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Настройки успешно сохранены' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Ошибка сохранения настроек' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Вы уверены, что хотите сбросить настройки к значениям по умолчанию?')) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/reset/defaults', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Настройки сброшены к значениям по умолчанию' });
        loadData();
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      setMessage({ type: 'error', text: 'Ошибка сброса настроек' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/export/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ type: 'success', text: 'Настройки экспортированы' });
      } else {
        throw new Error('Failed to export settings');
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      setMessage({ type: 'error', text: 'Ошибка экспорта настроек' });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка настроек...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Ошибка загрузки настроек</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Системные настройки</h1>
          <p className="mt-2 text-gray-600">
            Управление глобальными настройками платформы
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Всего пользователей</h3>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Активные пользователи</h3>
              <p className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Памятных страниц</h3>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalMemorialPages}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Использовано места</h3>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(statistics.storageUsed)}</p>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {connections && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Статус подключений</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  connections.database ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>База данных</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  connections.yandexCloud ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>Yandex Cloud</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  connections.email ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>Email сервис</span>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'general', name: 'Общие' },
                { id: 'limits', name: 'Лимиты' },
                { id: 'integrations', name: 'Интеграции' },
                { id: 'subscriptions', name: 'Подписки' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Режим технического обслуживания
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({
                        ...settings,
                        maintenanceMode: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Включить режим технического обслуживания
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Требуется модерация контента
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.moderationRequired}
                      onChange={(e) => setSettings({
                        ...settings,
                        moderationRequired: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Весь новый контент требует одобрения модератора
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Limits Settings */}
            {activeTab === 'limits' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Продолжительность пробного периода (дни)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.trialPeriodDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      trialPeriodDays: parseInt(e.target.value)
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимальный размер файла (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1024"
                    value={Math.round(settings.maxFileSize / (1024 * 1024))}
                    onChange={(e) => setSettings({
                      ...settings,
                      maxFileSize: parseInt(e.target.value) * 1024 * 1024
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Лимит символов в биографии (бесплатные аккаунты)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={settings.biographyCharLimit}
                    onChange={(e) => setSettings({
                      ...settings,
                      biographyCharLimit: parseInt(e.target.value)
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимальное количество файлов на странице
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.maxFilesPerPage}
                    onChange={(e) => setSettings({
                      ...settings,
                      maxFilesPerPage: parseInt(e.target.value)
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            )}

            {/* Integrations Settings */}
            {activeTab === 'integrations' && (
              <div className="space-y-8">
                {/* Email Settings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Настройки Email</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.emailSettings.smtpHost}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: {
                            ...settings.emailSettings,
                            smtpHost: e.target.value
                          }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.emailSettings.smtpPort}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: {
                            ...settings.emailSettings,
                            smtpPort: parseInt(e.target.value)
                          }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP User
                      </label>
                      <input
                        type="text"
                        value={settings.emailSettings.smtpUser}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: {
                            ...settings.emailSettings,
                            smtpUser: e.target.value
                          }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.emailSettings.fromEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: {
                            ...settings.emailSettings,
                            fromEmail: e.target.value
                          }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Yandex Cloud Settings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Настройки Yandex Cloud</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bucket Name
                      </label>
                      <input
                        type="text"
                        value={settings.yandexCloudSettings.bucketName}
                        onChange={(e) => setSettings({
                          ...settings,
                          yandexCloudSettings: {
                            ...settings.yandexCloudSettings,
                            bucketName: e.target.value
                          }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region
                      </label>
                      <input
                        type="text"
                        value={settings.yandexCloudSettings.region}
                        onChange={(e) => setSettings({
                          ...settings,
                          yandexCloudSettings: {
                            ...settings.yandexCloudSettings,
                            region: e.target.value
                          }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions Settings */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Продолжительность пробного периода (дни)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.subscriptionSettings.trialDurationDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscriptionSettings: {
                        ...settings.subscriptionSettings,
                        trialDurationDays: parseInt(e.target.value)
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цена Premium (месяц)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.subscriptionSettings.premiumPriceMonthly}
                      onChange={(e) => setSettings({
                        ...settings,
                        subscriptionSettings: {
                          ...settings.subscriptionSettings,
                          premiumPriceMonthly: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цена Premium (год)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.subscriptionSettings.premiumPriceYearly}
                      onChange={(e) => setSettings({
                        ...settings,
                        subscriptionSettings: {
                          ...settings.subscriptionSettings,
                          premiumPriceYearly: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Валюта
                  </label>
                  <select
                    value={settings.subscriptionSettings.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscriptionSettings: {
                        ...settings.subscriptionSettings,
                        currency: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="RUB">RUB - Российский рубль</option>
                    <option value="USD">USD - Доллар США</option>
                    <option value="EUR">EUR - Евро</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <div className="space-x-3">
              <button
                onClick={handleExportSettings}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Экспорт настроек
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                Сбросить к умолчанию
              </button>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}