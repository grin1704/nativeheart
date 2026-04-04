'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import type { MemorialPage, User, MediaFile } from '@/types';
import ImageCropper from './ImageCropper';

interface BasicInfoEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

export default function BasicInfoEditor({ memorialPage, user, onUpdate, onError }: BasicInfoEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<MediaFile | null>(null);
  const [loadingMainPhoto, setLoadingMainPhoto] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load main photo data when component mounts or mainPhotoId changes
  useEffect(() => {
    const loadMainPhoto = async () => {
      if (memorialPage.mainPhotoId && !mainPhoto) {
        setLoadingMainPhoto(true);
        try {
          const response = await fetch(`/api/media/${memorialPage.mainPhotoId}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            setMainPhoto(result.data);
          }
        } catch (error) {
          console.error('Failed to load main photo:', error);
        } finally {
          setLoadingMainPhoto(false);
        }
      }
    };

    loadMainPhoto();
  }, [memorialPage.mainPhotoId, mainPhoto]);

  const handleInputChange = (field: keyof MemorialPage, value: any) => {
    onUpdate({ [field]: value });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Можно загружать только изображения');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      onError('Размер файла не должен превышать 5MB');
      return;
    }

    // Show cropper
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setCropperImage(null);
      
      const formData = new FormData();
      formData.append('file', croppedBlob, selectedFile.name);
      formData.append('type', 'main_photo');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setMainPhoto(result.data);
        onUpdate({ mainPhotoId: result.data.id });
      } else {
        onError(result.error || 'Ошибка загрузки фото');
      }
    } catch (err) {
      onError('Ошибка загрузки фото');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleCropCancel = () => {
    setCropperImage(null);
    setSelectedFile(null);
  };

  const formatDateForInput = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handlePasswordChange = async (password: string) => {
    try {
      const response = await apiRequest('PUT', `/memorial-pages/${memorialPage.id}`, {
        password: password
      });

      if (response.success) {
        alert('Пароль успешно установлен!\n\nСохраните его в надежном месте:\n' + password);
      } else {
        onError(response.error || 'Ошибка установки пароля');
      }
    } catch (err) {
      onError('Ошибка установки пароля');
    }
  };

  return (
    <>
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
      
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
          <p className="text-sm text-gray-600">
            Заполните основные сведения о человеке. Эта информация будет отображаться на главной странице памятника.
          </p>
        </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Полное имя *
          </label>
          <input
            type="text"
            id="fullName"
            value={memorialPage.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите полное имя"
            required
          />
        </div>

        {/* Birth Date */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
            Дата рождения *
          </label>
          <input
            type="date"
            id="birthDate"
            value={formatDateForInput(memorialPage.birthDate)}
            onChange={(e) => handleInputChange('birthDate', new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Death Date */}
        <div>
          <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-2">
            Дата смерти *
          </label>
          <input
            type="date"
            id="deathDate"
            value={formatDateForInput(memorialPage.deathDate)}
            onChange={(e) => handleInputChange('deathDate', new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Main Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Главное фото
          </label>
          <div className="flex items-start space-x-4">
            {/* Photo Preview */}
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {loadingMainPhoto ? (
                <div className="text-center">
                  <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-xs text-gray-500 mt-1">Загрузка...</p>
                </div>
              ) : mainPhoto?.url ? (
                <img
                  src={mainPhoto.url}
                  alt="Главное фото"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500 mt-1">Нет фото</p>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <input
                type="file"
                id="mainPhoto"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="mainPhoto"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Выбрать фото
                  </>
                )}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Рекомендуемый размер: 400x400px. Максимальный размер файла: 5MB.
                <br />
                Поддерживаемые форматы: JPG, PNG, GIF.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={memorialPage.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Сделать страницу приватной (потребуется пароль для доступа)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Если включено, посетители должны будут ввести пароль для просмотра страницы.
            </p>
          </div>

          {memorialPage.isPrivate && (
            <div className="ml-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Настройка пароля
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Установите пароль, который посетители должны будут ввести для доступа к странице.
                Сохраните этот пароль в надежном месте - вы сможете сообщить его близким людям.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Важно!</p>
                    <p>Пароль хранится в зашифрованном виде. После сохранения вы не сможете увидеть его снова, только изменить на новый.</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const password = prompt('Введите новый пароль для страницы:');
                  if (password && password.trim()) {
                    // Сохраняем пароль через API
                    handlePasswordChange(password.trim());
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Установить/Изменить пароль
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}