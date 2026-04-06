'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Batch {
  id: string;
  name: string;
  totalCount: number;
  freeCount: number;
  assignedCount: number;
  createdAt: string;
}

interface PoolStats {
  total: number;
  free: number;
  assigned: number;
}

interface Plate {
  id: string;
  token: string;
  status: string;
  assignedAt: string | null;
  createdAt: string;
  batch: { name: string };
  memorialPage: { id: string; fullName: string; slug: string } | null;
}

export default function QrPlatesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [platesTotal, setPlatesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'batches' | 'plates'>('batches');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCount, setNewBatchCount] = useState(50);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return null; }
    return token;
  };

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [batchesRes, statsRes] = await Promise.all([
        fetch('/api/admin/qr-plates/batches', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/qr-plates/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (batchesRes.ok) setBatches((await batchesRes.json()).data);
      if (statsRes.ok) setStats((await statsRes.json()).data);
    } catch {
      setMessage({ type: 'error', text: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlates = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (filterStatus) params.set('status', filterStatus);
    if (filterBatchId) params.set('batchId', filterBatchId);
    try {
      const res = await fetch(`/api/admin/qr-plates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlates(data.plates);
        setPlatesTotal(data.total);
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка загрузки табличек' });
    }
  }, [page, filterStatus, filterBatchId]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (activeTab === 'plates') loadPlates(); }, [activeTab, loadPlates]);

  const handleCreateBatch = async () => {
    const token = getToken();
    if (!token || !newBatchName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/qr-plates/batches', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBatchName.trim(), count: newBatchCount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Партия создана: ${newBatchCount} табличек` });
        setShowCreateForm(false);
        setNewBatchName('');
        setNewBatchCount(50);
        loadData();
      } else {
        setMessage({ type: 'error', text: data.message || 'Ошибка создания партии' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка создания партии' });
    } finally {
      setCreating(false);
    }
  };

  const handleExport = async (batchId: string, batchName: string) => {
    const token = getToken();
    if (!token) return;
    setExporting(batchId);
    try {
      const res = await fetch(`/api/admin/qr-plates/batches/${batchId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Ошибка экспорта');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-plates-${batchName.replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage({ type: 'success', text: 'ZIP-архив со SVG файлами скачан' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Ошибка экспорта' });
    } finally {
      setExporting(null);
    }
  };

  const totalPages = Math.ceil(platesTotal / 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR-таблички</h1>
          <p className="text-sm text-gray-500 mt-1">Управление пулом QR-кодов для физических табличек</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Создать партию
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Статистика пула */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => { setFilterStatus(''); setFilterBatchId(''); setPage(1); setActiveTab('plates'); }}
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
          >
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Всего табличек</p>
          </button>
          <button
            onClick={() => { setFilterStatus('free'); setFilterBatchId(''); setPage(1); setActiveTab('plates'); }}
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md hover:bg-green-50 transition-all cursor-pointer"
          >
            <p className="text-2xl font-bold text-green-600">{stats.free}</p>
            <p className="text-sm text-gray-500">Свободных</p>
          </button>
          <button
            onClick={() => { setFilterStatus('assigned'); setFilterBatchId(''); setPage(1); setActiveTab('plates'); }}
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer"
          >
            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
            <p className="text-sm text-gray-500">Назначено</p>
          </button>
        </div>
      )}

      {/* Форма создания партии */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-blue-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Новая партия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название партии
              </label>
              <input
                type="text"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                placeholder="Партия #1, январь 2026"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество табличек (1–500)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={newBatchCount}
                onChange={(e) => setNewBatchCount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateBatch}
              disabled={creating || !newBatchName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Табы */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex px-6">
            {(['batches', 'plates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 border-b-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'batches' ? 'Партии' : 'Все таблички'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Партии */}
          {activeTab === 'batches' && (
            <div>
              {batches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Партий пока нет. Создайте первую.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">Название</th>
                      <th className="pb-3 font-medium">Всего</th>
                      <th className="pb-3 font-medium">Свободных</th>
                      <th className="pb-3 font-medium">Назначено</th>
                      <th className="pb-3 font-medium">Создана</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{batch.name}</td>
                        <td className="py-3 text-gray-600">{batch.totalCount}</td>
                        <td className="py-3">
                          <button
                            onClick={() => { setFilterStatus('free'); setFilterBatchId(batch.id); setPage(1); setActiveTab('plates'); }}
                            className="text-green-600 font-medium hover:underline"
                          >
                            {batch.freeCount}
                          </button>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => { setFilterStatus('assigned'); setFilterBatchId(batch.id); setPage(1); setActiveTab('plates'); }}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {batch.assignedCount}
                          </button>
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(batch.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleExport(batch.id, batch.name)}
                            disabled={exporting === batch.id}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50"
                          >
                            {exporting === batch.id ? 'Экспорт...' : 'Экспорт SVG'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Все таблички */}
          {activeTab === 'plates' && (
            <div>
              {/* Фильтры */}
              <div className="flex gap-4 mb-4">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  <option value="">Все статусы</option>
                  <option value="free">Свободные</option>
                  <option value="assigned">Назначенные</option>
                </select>
                <select
                  value={filterBatchId}
                  onChange={(e) => { setFilterBatchId(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  <option value="">Все партии</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <button
                  onClick={loadPlates}
                  className="px-3 py-1.5 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
                >
                  Обновить
                </button>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Токен</th>
                    <th className="pb-3 font-medium">Статус</th>
                    <th className="pb-3 font-medium">Партия</th>
                    <th className="pb-3 font-medium">Страница</th>
                    <th className="pb-3 font-medium">Назначена</th>
                  </tr>
                </thead>
                <tbody>
                  {plates.map((plate) => (
                    <tr key={plate.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs text-gray-600">{plate.token}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          plate.status === 'free'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {plate.status === 'free' ? 'Свободна' : 'Назначена'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">{plate.batch.name}</td>
                      <td className="py-2">
                        {plate.memorialPage ? (
                          <a
                            href={`/memorial/${plate.memorialPage.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {plate.memorialPage.fullName}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2 text-gray-500">
                        {plate.assignedAt
                          ? new Date(plate.assignedAt).toLocaleDateString('ru-RU')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Показано {plates.length} из {platesTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                      ←
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
