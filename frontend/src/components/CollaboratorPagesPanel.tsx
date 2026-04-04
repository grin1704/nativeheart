'use client';

import { useState, useEffect } from 'react';
import { Users, Edit } from 'lucide-react';
import Link from 'next/link';
import { formatCount } from '@/utils/pluralize';

interface CollaboratorPermissions {
  basicInfo: boolean;
  biography: boolean;
  gallery: boolean;
  memories: boolean;
  timeline: boolean;
  tributes: boolean;
  burialLocation: boolean;
}

interface CollaboratorPage {
  id: string;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  mainPhoto?: {
    id: string;
    url: string;
    thumbnailUrl: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  collaboratorPermissions: CollaboratorPermissions;
  collaboratorSince: string;
  _count: {
    memories: number;
    tributes: number;
    mediaFiles: number;
  };
}

export default function CollaboratorPagesPanel() {
  const [pages, setPages] = useState<CollaboratorPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/my/collaborator-pages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load collaborator pages:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Страницы, где я редактор
          </h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
            {pages.length}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Страницы, к редактированию которых вас пригласили
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-indigo-300 transition-colors"
            >
              {/* Header with photo and name */}
              <div className="flex items-start gap-3 mb-3">
                {/* Circular Photo */}
                {page.mainPhoto ? (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    <img
                      src={page.mainPhoto.url}
                      alt={page.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl text-indigo-600 font-serif">
                      {page.fullName.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Name and dates */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                    {page.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(page.birthDate).getFullYear()} -{' '}
                    {new Date(page.deathDate).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Owner info */}
              <div className="text-xs text-gray-500 mb-3">
                Владелец: {page.owner.name}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>{formatCount(page._count.mediaFiles, 'фото', 'фото', 'фото')}</span>
                <span>{formatCount(page._count.memories, 'воспоминание', 'воспоминания', 'воспоминаний')}</span>
                <span>{formatCount(page._count.tributes, 'отзыв', 'отзыва', 'отзывов')}</span>
              </div>

              {/* Date badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Edit className="w-3 h-3" />
                  Редактор
                </span>
                <span className="text-xs text-gray-500">
                  с {new Date(page.collaboratorSince).toLocaleDateString('ru-RU')}
                </span>
              </div>

              {/* Actions */}
              <Link
                href={`/dashboard/edit/${page.id}`}
                className="block w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 text-center transition-colors"
              >
                Редактировать
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
