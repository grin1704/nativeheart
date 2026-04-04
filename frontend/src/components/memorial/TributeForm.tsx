'use client';

import React, { useState } from 'react';
import { apiRequest } from '@/utils/api';

interface TributeFormProps {
  memorialPageId: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

interface TributeFormData {
  authorName: string;
  authorEmail: string;
  text: string;
  photoId?: string;
}

export const TributeForm: React.FC<TributeFormProps> = ({
  memorialPageId,
  onSubmitted,
  onCancel
}) => {
  const [formData, setFormData] = useState<TributeFormData>({
    authorName: '',
    authorEmail: '',
    text: ''
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<{
    id: string;
    url: string;
    thumbnailUrl?: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Можно загружать только изображения');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5 МБ');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'tribute');

      const response = await fetch('/api/media/upload/tribute', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success && result.data) {
        setUploadedPhoto(result.data);
        setFormData(prev => ({
          ...prev,
          photoId: result.data.id
        }));
      } else {
        setError(result.error || 'Ошибка загрузки фото');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    setFormData(prev => ({
      ...prev,
      photoId: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.authorName.trim() || !formData.text.trim()) {
      setError('Пожалуйста, заполните обязательные поля');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiRequest(
        'POST',
        `/memorial-pages/${memorialPageId}/tributes`,
        {
          authorName: formData.authorName.trim(),
          authorEmail: formData.authorEmail.trim() || undefined,
          text: formData.text.trim(),
          photoId: formData.photoId
        }
      );

      if (response.success) {
        onSubmitted();
      } else {
        setError(response.error || 'Ошибка отправки отзыва');
      }
    } catch (err) {
      console.error('Error submitting tribute:', err);
      setError('Ошибка отправки отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Оставить отзыв</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Name */}
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-foreground mb-1">
            Ваше имя *
          </label>
          <input
            type="text"
            id="authorName"
            name="authorName"
            value={formData.authorName}
            onChange={handleInputChange}
            required
            maxLength={255}
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Введите ваше имя"
          />
        </div>

        {/* Author Email */}
        <div>
          <label htmlFor="authorEmail" className="block text-sm font-medium text-foreground mb-1">
            Email (необязательно)
          </label>
          <input
            type="email"
            id="authorEmail"
            name="authorEmail"
            value={formData.authorEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="your@email.com"
          />
        </div>

        {/* Tribute Text */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-foreground mb-1">
            Ваш отзыв *
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            required
            maxLength={5000}
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical"
            placeholder="Поделитесь своими воспоминаниями..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.text.length}/5000 символов
          </p>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Фотография (необязательно)
          </label>
          
          {uploadedPhoto ? (
            <div className="flex items-center space-x-4">
              <img
                src={uploadedPhoto.thumbnailUrl || uploadedPhoto.url}
                alt="Загруженное фото"
                className="h-16 w-16 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="text-destructive hover:text-destructive/90 text-sm"
              >
                Удалить фото
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Максимальный размер: 5 МБ. Поддерживаются форматы: JPG, PNG, GIF
              </p>
            </div>
          )}
          
          {uploading && (
            <p className="text-sm text-primary mt-2">Загрузка фото...</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-foreground bg-background border border-border rounded-md hover:bg-accent transition-colors"
          >
            Отменить
          </button>
          <button
            type="submit"
            disabled={submitting || uploading || !formData.authorName.trim() || !formData.text.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Отправка...' : 'Отправить отзыв'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TributeForm;