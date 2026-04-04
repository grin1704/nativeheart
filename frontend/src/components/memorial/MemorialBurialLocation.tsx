'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';

interface BurialLocation {
  id: string;
  memorialPageId: string;
  address: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
}

interface MemorialBurialLocationProps {
  memorialPageId: string;
}

export const MemorialBurialLocation: React.FC<MemorialBurialLocationProps> = ({ memorialPageId }) => {
  const [burialLocation, setBurialLocation] = useState<BurialLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBurialLocation = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<BurialLocation>(
          'GET',
          `/memorial-pages/${memorialPageId}/burial-location`
        );

        if (response.success && response.data) {
          setBurialLocation(response.data);
        } else {
          setBurialLocation(null);
        }
      } catch (err) {
        console.error('Error fetching burial location:', err);
        setError('Ошибка загрузки информации о месте захоронения');
      } finally {
        setLoading(false);
      }
    };

    fetchBurialLocation();
  }, [memorialPageId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!burialLocation) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Место захоронения не указано</h3>
        <p className="text-muted-foreground">Информация о месте захоронения пока не добавлена.</p>
      </div>
    );
  }

  const openInMaps = () => {
    if (burialLocation.latitude && burialLocation.longitude) {
      // Open in Yandex Maps
      const url = `https://yandex.ru/maps/?pt=${burialLocation.longitude},${burialLocation.latitude}&z=16&l=map`;
      window.open(url, '_blank');
    } else {
      // Search by address
      const searchQuery = encodeURIComponent(burialLocation.address);
      const url = `https://yandex.ru/maps/?text=${searchQuery}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Место захоронения</h2>
      
      <div className="space-y-6">
        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Адрес</h3>
          <p className="text-muted-foreground">{burialLocation.address}</p>
        </div>

        {/* Description */}
        {burialLocation.description && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Описание</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{burialLocation.description}</p>
          </div>
        )}

        {/* Instructions */}
        {burialLocation.instructions && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Как найти</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{burialLocation.instructions}</p>
          </div>
        )}

        {/* Map */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Карта</h3>
            <button
              onClick={openInMaps}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              Открыть в Яндекс.Картах
            </button>
          </div>
          
          {burialLocation.latitude && burialLocation.longitude ? (
            <div className="bg-muted rounded-lg overflow-hidden">
              <iframe
                src={`https://yandex.ru/map-widget/v1/?pt=${burialLocation.longitude},${burialLocation.latitude}&z=16&l=map`}
                width="100%"
                height="300"
                frameBorder="0"
                className="w-full h-75"
                title="Карта места захоронения"
              />
            </div>
          ) : (
            <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-muted-foreground mb-4">
                Точные координаты не указаны. Вы можете найти место по адресу в Яндекс.Картах.
              </p>
              <button
                onClick={openInMaps}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Найти на карте
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-start">
            <svg className="flex-shrink-0 h-5 w-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-primary">Информация для посетителей</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Пожалуйста, соблюдайте тишину и порядок при посещении места захоронения. 
                Уточните режим работы кладбища перед визитом.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialBurialLocation;