'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface MemorialPage {
  id: string;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  biographyText?: string;
  createdAt: string;
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

  useEffect(() => {
    const fetchMemorialPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/memorial-pages/slug/${slug}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setMemorialPage(data.data);
        } else {
          setError(data.error || 'Памятная страница не найдена');
        }
      } catch (err) {
        console.error('Error fetching memorial page:', err);
        setError('Произошла ошибка при загрузке страницы');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMemorialPage();
    }
  }, [slug]);

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

  const birthYear = new Date(memorialPage.birthDate).getFullYear();
  const deathYear = new Date(memorialPage.deathDate).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {memorialPage.fullName}
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            {birthYear} - {deathYear}
          </p>
          <div className="mt-8 w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Biography Section */}
        {memorialPage.biographyText && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">О человеке</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {memorialPage.biographyText}
              </p>
            </div>
          </div>
        )}

        {/* Life Dates */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Даты жизни</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-green-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Рождение</h3>
              <p className="text-gray-600">
                {new Date(memorialPage.birthDate).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Упокоение</h3>
              <p className="text-gray-600">
                {new Date(memorialPage.deathDate).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Memorial Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Информация о странице</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              <span className="font-medium">Создана:</span>{' '}
              {new Date(memorialPage.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p>
              <span className="font-medium">Создатель страницы:</span> {memorialPage.owner.name}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-gray-500">
            Память живет в наших сердцах
          </p>
        </div>
      </div>
    </div>
  );
}