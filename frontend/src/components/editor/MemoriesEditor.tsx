'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import type { MemorialPage, User, Memory, MediaFile } from '@/types';

interface MemoriesEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

interface MemoryFormData {
  date: string;
  title: string;
  description: string;
}

export default function MemoriesEditor({ memorialPage, user, onUpdate, onError }: MemoriesEditorProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<MemoryFormData>({
    date: '',
    title: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [formPhotos, setFormPhotos] = useState<string[]>([]); // Array of photo IDs for the form

  // Check access based on API response, not user subscription
  const isPremiumFeature = !hasAccess && subscriptionRequired;

  useEffect(() => {
    loadMemories();
  }, [memorialPage.id]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<Memory[]>('GET', `/memorial-pages/${memorialPage.id}/memories`);
      if (response.success) {
        setMemories(response.data || []);
        setHasAccess(true);
        setSubscriptionRequired(false);
      } else if (response.error && response.error.includes('доступен только в платной версии')) {
        setHasAccess(false);
        setSubscriptionRequired(true);
        setMemories([]);
      }
    } catch (err) {
      console.error('Error loading memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      onError('Заполните обязательные поля');
      return;
    }

    try {
      setLoading(true);
      
      const memoryData = {
        date: new Date(formData.date),
        title: formData.title,
        description: formData.description || undefined,
        photoIds: formPhotos.length > 0 ? formPhotos : undefined,
      };

      if (editingMemory) {
        // Update existing memory
        const response = await apiRequest('PUT', `/memories/${editingMemory.id}`, memoryData);
        if (response.success) {
          setMemories(prev => prev.map(m => m.id === editingMemory.id ? response.data : m));
          resetForm();
        } else {
          onError(response.error || 'Ошибка обновления воспоминания');
        }
      } else {
        // Create new memory
        const response = await apiRequest('POST', `/memorial-pages/${memorialPage.id}/memories`, memoryData);
        if (response.success) {
          setMemories(prev => [...prev, response.data]);
          resetForm();
        } else {
          onError(response.error || 'Ошибка создания воспоминания');
        }
      }
    } catch (err) {
      onError('Ошибка сохранения воспоминания');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setFormData({
      date: new Date(memory.date).toISOString().split('T')[0],
      title: memory.title,
      description: memory.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это воспоминание?')) {
      return;
    }

    try {
      const response = await apiRequest('DELETE', `/memories/${memoryId}`);
      if (response.success) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      } else {
        onError(response.error || 'Ошибка удаления воспоминания');
      }
    } catch (err) {
      onError('Ошибка удаления воспоминания');
    }
  };

  const handlePhotoUpload = async (memoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      onError('Можно загружать только изображения');
      return;
    }

    // Validate file sizes (5MB max each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      onError('Размер каждого файла не должен превышать 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const uploadPromises = files.map(async (file) => {
        // First upload the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'memory_photo');
        formData.append('memorialPageId', memorialPage.id);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          return uploadResult;
        }

        // Then add photo to memory
        const addPhotoResponse = await apiRequest('POST', `/memories/${memoryId}/photos`, {
          photoId: uploadResult.data.id,
        });

        return addPhotoResponse;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        onError(`Не удалось загрузить ${failedUploads.length} файл(ов)`);
      }

      if (successfulUploads.length > 0) {
        // Reload memories to get updated photos
        loadMemories();
      }
    } catch (err) {
      onError('Ошибка загрузки фотографий');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async (memoryId: string, photoId: string) => {
    try {
      const response = await apiRequest('DELETE', `/memories/${memoryId}/photos/${photoId}`);
      if (response.success) {
        // Reload memories to get updated photos
        loadMemories();
      } else {
        onError(response.error || 'Ошибка удаления фото');
      }
    } catch (err) {
      onError('Ошибка удаления фото');
    }
  };

  const handleFormPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      onError('Можно загружать только изображения');
      return;
    }

    // Validate file sizes (5MB max each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      onError('Размер каждого файла не должен превышать 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const uploadPromises = files.map(async (file) => {
        // Upload the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'memory_photo');
        formData.append('memorialPageId', memorialPage.id);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          return uploadResult;
        }

        return uploadResult;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        onError(`Не удалось загрузить ${failedUploads.length} файл(ов)`);
      }

      if (successfulUploads.length > 0) {
        const newPhotoIds = successfulUploads.map(result => result.data.id);
        setFormPhotos(prev => [...prev, ...newPhotoIds]);
      }
    } catch (err) {
      onError('Ошибка загрузки фотографий');
    } finally {
      setUploading(false);
    }
  };

  const removeFormPhoto = (photoId: string) => {
    setFormPhotos(prev => prev.filter(id => id !== photoId));
  };

  const resetForm = () => {
    setFormData({ date: '', title: '', description: '' });
    setEditingMemory(null);
    setShowForm(false);
    setFormPhotos([]);
  };

  const sortedMemories = memories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isPremiumFeature) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Премиум функция</h3>
          <p className="mt-1 text-sm text-gray-500">
            Раздел воспоминаний доступен только в премиум версии.
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Воспоминания</h2>
            <p className="text-sm text-gray-600">
              Создайте хронологическую линию важных моментов и событий из жизни человека.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить воспоминание
          </button>
        </div>
      </div>

      {/* Memory Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            {editingMemory ? 'Редактировать воспоминание' : 'Новое воспоминание'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="memoryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Дата *
                </label>
                <input
                  type="date"
                  id="memoryDate"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="memoryTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок *
                </label>
                <input
                  type="text"
                  id="memoryTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Название события или периода"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="memoryDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="memoryDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Расскажите подробнее об этом событии или периоде жизни..."
              />
            </div>
            
            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фотографии
              </label>
              
              {/* Upload Button */}
              <div className="mb-3">
                <input
                  type="file"
                  id="memoryPhotos"
                  accept="image/*"
                  multiple
                  onChange={handleFormPhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="memoryPhotos"
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Добавить фото
                    </>
                  )}
                </label>
              </div>

              {/* Uploaded Photos Preview */}
              {formPhotos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {formPhotos.map((photoId) => (
                    <div key={photoId} className="relative group">
                      <div className="w-full h-20 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFormPhoto(photoId)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        title="Удалить фото"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Максимальный размер файла: 5MB. Поддерживаемые форматы: JPG, PNG, GIF.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : editingMemory ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Memories List */}
      {loading && memories.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      ) : sortedMemories.length > 0 ? (
        <div className="space-y-6">
          {sortedMemories.map((memory, index) => (
            <div key={memory.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(memory.date).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{memory.title}</h3>
                  {memory.description && (
                    <p className="text-gray-600 mt-2">{memory.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(memory)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Редактировать"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Удалить"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Memory Photos */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Фотографии</span>
                  <div>
                    <input
                      type="file"
                      id={`memoryPhotos-${memory.id}`}
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(memory.id, e)}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label
                      htmlFor={`memoryPhotos-${memory.id}`}
                      className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="-ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Добавить
                    </label>
                  </div>
                </div>

                {memory.photos && memory.photos.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {memory.photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.originalName}
                          className="w-full h-20 object-cover rounded border border-gray-200"
                        />
                        <button
                          onClick={() => handlePhotoDelete(memory.id, photo.id)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          title="Удалить фото"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center">
                    <p className="text-sm text-gray-500">Нет фотографий</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Нет воспоминаний</h3>
          <p className="mt-1 text-sm text-gray-500">
            Добавьте первое воспоминание, чтобы начать создавать временную линию жизни.
          </p>
        </div>
      )}
    </div>
  );
}