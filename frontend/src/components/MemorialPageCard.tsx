'use client';

import { useState } from 'react';
import type { MemorialPage } from '@/types';

interface MemorialPageCardProps {
  page: MemorialPage;
  onEdit: (pageId: string) => void;
  onView: (slug: string) => void;
  onDelete?: (pageId: string) => void;
}

export default function MemorialPageCard({ page, onEdit, onView, onDelete }: MemorialPageCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(page.id);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).getFullYear();
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дн. назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} мес. назад`;
    return `${Math.floor(diffInDays / 365)} г. назад`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header with main photo placeholder */}
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
        {page.mainPhotoId ? (
          <img
            src={`/api/media/${page.mainPhotoId}`}
            alt={page.fullName}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-xs text-gray-500 mt-1">Нет фото</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and privacy status */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg truncate pr-2">
            {page.fullName}
          </h3>
          <div className="flex flex-col items-end space-y-1">
            {page.isPrivate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Приватная
              </span>
            )}
          </div>
        </div>

        {/* Life years */}
        <p className="text-gray-600 mb-3">
          {formatDate(page.birthDate)} - {formatDate(page.deathDate)}
        </p>

        {/* Biography preview */}
        {page.biographyText && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {page.biographyText.length > 100 
              ? `${page.biographyText.substring(0, 100)}...` 
              : page.biographyText
            }
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Создана {getTimeAgo(page.createdAt)}</span>
          <span>Обновлена {getTimeAgo(page.updatedAt)}</span>
        </div>

        {/* QR Code indicator */}
        {page.qrCodeUrl && (
          <div className="flex items-center text-xs text-green-600 mb-3">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            QR-код создан
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(page.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Редактировать
          </button>
          <button
            onClick={() => onView(page.slug)}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Просмотр
          </button>
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Удалить памятную страницу?</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Вы уверены, что хотите удалить страницу "{page.fullName}"? 
                  Это действие нельзя отменить.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}