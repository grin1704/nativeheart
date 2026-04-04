'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import BasicInfoEditor from '@/components/editor/BasicInfoEditor';
import BiographyEditor from '@/components/editor/BiographyEditor';
import MediaGalleryEditor from '@/components/editor/MediaGalleryEditor';
import MemoriesEditor from '@/components/editor/MemoriesEditor';
import BurialLocationEditor from '@/components/editor/BurialLocationEditor';
import TributesEditor from '@/components/editor/TributesEditor';
import QRCodeEditor from '@/components/editor/QRCodeEditor';
import TimelineEditor from '@/components/editor/TimelineEditor';
import CollaboratorsEditor from '@/components/editor/CollaboratorsEditor';
import type { MemorialPage, User } from '@/types';

interface MemorialPageWithOwner extends MemorialPage {
  owner?: {
    id: string;
    name: string;
    email: string;
    subscriptionType?: 'trial' | 'free' | 'premium';
    subscriptionExpiresAt?: Date | null;
  };
}

interface EditorSection {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  enabled: boolean;
}

export default function MemorialPageEditor() {
  const [memorialPage, setMemorialPage] = useState<MemorialPageWithOwner | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [pageId, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const userResponse = await apiRequest<any>('GET', '/auth/me');
      if (!userResponse.success) {
        throw new Error(userResponse.error || 'Ошибка загрузки данных пользователя');
      }
      // Backend returns { user: {...} }, so we need to extract the user object
      const userData = userResponse.data?.user || userResponse.data;
      console.log('User data loaded:', userData);
      setUser(userData);

      // Load memorial page data
      const pageResponse = await apiRequest<MemorialPageWithOwner>('GET', `/memorial-pages/id/${pageId}`);
      if (!pageResponse.success) {
        throw new Error(pageResponse.error || 'Ошибка загрузки страницы');
      }
      setMemorialPage(pageResponse.data!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!memorialPage) return;
    
    try {
      setSaving(true);
      
      // Отправляем только разрешенные для обновления поля
      const updateData = {
        fullName: memorialPage.fullName,
        birthDate: memorialPage.birthDate instanceof Date 
          ? memorialPage.birthDate.toISOString().split('T')[0] 
          : memorialPage.birthDate,
        deathDate: memorialPage.deathDate instanceof Date 
          ? memorialPage.deathDate.toISOString().split('T')[0] 
          : memorialPage.deathDate,
        mainPhotoId: memorialPage.mainPhotoId || null,
        biographyText: memorialPage.biographyText || '',
        isPrivate: memorialPage.isPrivate,
      };
      
      const response = await apiRequest('PUT', `/memorial-pages/${pageId}`, updateData);
      
      if (response.success) {
        setHasUnsavedChanges(false);
        // Обновляем локальные данные с ответом сервера
        if (response.data) {
          setMemorialPage(response.data);
        }
      } else {
        setError(response.error || 'Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handlePageUpdate = (updates: Partial<MemorialPage>) => {
    setMemorialPage(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  const getSections = (): EditorSection[] => {
    // Check if the page owner has premium access (not the current user)
    // For editing, we should check the page owner's subscription, not the editor's
    const pageOwnerHasPremium = memorialPage?.owner?.subscriptionType === 'premium' || 
                               memorialPage?.owner?.subscriptionType === 'trial';
    
    // If current user is the owner, use their subscription
    // If current user is a collaborator, use page owner's subscription
    const isPremium = (user?.id === memorialPage?.ownerId) 
      ? (user?.subscriptionType === 'premium' || user?.subscriptionType === 'trial')
      : pageOwnerHasPremium;
    
    return [
      {
        id: 'basic',
        title: 'Основная информация',
        component: BasicInfoEditor,
        enabled: true
      },
      {
        id: 'biography',
        title: 'Биография',
        component: BiographyEditor,
        enabled: true
      },
      {
        id: 'gallery',
        title: 'Фото и видео',
        component: MediaGalleryEditor,
        enabled: isPremium
      },
      {
        id: 'memories',
        title: 'Воспоминания',
        component: MemoriesEditor,
        enabled: isPremium
      },
      {
        id: 'timeline',
        title: 'Хронология жизни',
        component: TimelineEditor,
        enabled: true
      },
      {
        id: 'tributes',
        title: 'Слова близких',
        component: TributesEditor,
        enabled: isPremium
      },
      {
        id: 'burial',
        title: 'Место захоронения',
        component: BurialLocationEditor,
        enabled: true
      },
      {
        id: 'qrcode',
        title: 'QR-код',
        component: QRCodeEditor,
        enabled: true
      },
      {
        id: 'collaborators',
        title: 'Редакторы',
        component: CollaboratorsEditor,
        enabled: true
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!memorialPage || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{!memorialPage ? 'Страница не найдена' : 'Загрузка данных пользователя...'}</p>
        </div>
      </div>
    );
  }

  const sections = getSections();
  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Редактирование: {memorialPage.fullName}
              </h1>
              <p className="text-gray-600">
                {hasUnsavedChanges && <span className="text-orange-600">• Есть несохраненные изменения</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Назад к панели
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Разделы</h3>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      disabled={!section.enabled}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : section.enabled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {section.title}
                      {!section.enabled && (
                        <span className="ml-2 text-xs text-gray-400">(Premium)</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              {currentSection && (
                <currentSection.component
                  memorialPage={memorialPage}
                  user={user}
                  onUpdate={handlePageUpdate}
                  onError={setError}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}