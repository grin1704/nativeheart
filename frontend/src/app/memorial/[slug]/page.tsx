'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MemorialPageView } from '@/components/MemorialPageView';

interface MemorialPage {
  id: string;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  biographyText?: string;
  qrCodeUrl?: string;
  createdAt: string;
  mainPhoto?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
  } | null;
  biography?: {
    text: string;
    photos: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      originalName: string;
    }>;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PublicMemorialPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [memorialPage, setMemorialPage] = useState<MemorialPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchMemorialPage = async (pagePassword?: string) => {
    try {
      setLoading(true);
      setError(null);
      setPasswordError(null);
      
      const url = pagePassword 
        ? `/api/memorial-pages/slug/${slug}?password=${encodeURIComponent(pagePassword)}`
        : `/api/memorial-pages/slug/${slug}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setMemorialPage(data.data);
        setRequiresPassword(false);
      } else if (response.status === 401) {
        // Password required
        setRequiresPassword(true);
        if (pagePassword) {
          setPasswordError('Неверный пароль');
        }
      } else {
        setError(data.error || data.message || 'Памятная страница не найдена');
      }
    } catch (err) {
      console.error('Error fetching memorial page:', err);
      setError('Произошла ошибка при загрузке страницы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchMemorialPage();
    }
  }, [slug]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      fetchMemorialPage(password);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка памятной страницы...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Приватная страница</h2>
              <p className="text-gray-600">Для доступа к этой памятной странице требуется пароль</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Введите пароль"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!password.trim()}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Войти
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Страница не найдена</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!memorialPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Памятная страница не найдена</p>
        </div>
      </div>
    );
  }

  // Use the new MemorialPageView component with proper type conversion
  const memorialPageWithDetails = {
    ...memorialPage,
    birthDate: new Date(memorialPage.birthDate),
    deathDate: new Date(memorialPage.deathDate),
    createdAt: new Date(memorialPage.createdAt),
    updatedAt: new Date(),
    isPrivate: false,
    ownerId: memorialPage.owner.id,
    owner: {
      ...memorialPage.owner,
      subscriptionType: 'free' as const,
    },
    _count: {
      memories: 0,
      tributes: 0,
      mediaFiles: 0,
      photoGallery: 0,
      videoGallery: 0,
    },
  };

  return <MemorialPageView memorialPage={memorialPageWithDetails as any} />;
}