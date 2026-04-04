'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import { Lightbox } from '@/components/Lightbox';

interface MediaFile {
  id: string;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
  orderIndex: number;
}

interface Memory {
  id: string;
  memorialPageId: string;
  date: Date;
  title: string;
  description?: string;
  createdAt: Date;
  photos: MediaFile[];
}

interface MemoriesResponse {
  data: Memory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MemorialMemoriesProps {
  memorialPageId: string;
}

export const MemorialMemories: React.FC<MemorialMemoriesProps> = ({ memorialPageId }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{ url: string; caption?: string; alt?: string }>>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<MemoriesResponse>(
          'GET',
          `/memorial-pages/${memorialPageId}/memories?page=${page}&limit=10&sortBy=date&sortOrder=desc`
        );

        if (response.success && response.data) {
          // API returns data directly, not nested in response.data.data
          const memoriesData = Array.isArray(response.data) ? response.data : response.data.data || [];
          const paginationData = response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
          
          if (page === 1) {
            setMemories(memoriesData);
          } else {
            setMemories(prev => [...prev, ...memoriesData]);
          }
          setHasMore(paginationData.page < paginationData.totalPages);
        } else {
          // Check if it's a subscription error
          if (response.error && response.error.includes('доступен только в платной версии')) {
            setError('subscription_required');
          } else {
            setMemories([]);
          }
        }
      } catch (err) {
        console.error('Error fetching memories:', err);
        setError('Ошибка загрузки воспоминаний');
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [memorialPageId, page]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const openLightbox = (memoryPhotos: MediaFile[], photoIndex: number, memoryTitle: string) => {
    const images = memoryPhotos.map(photo => ({
      url: photo.url,
      alt: photo.originalName
    }));
    setLightboxImages(images);
    setLightboxIndex(photoIndex);
    setLightboxOpen(true);
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const handleLightboxPrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  if (loading && page === 1) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-gray-200 pl-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Воспоминания</h2>
      
      {error === 'subscription_required' ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Премиум функция</h3>
          <p className="text-muted-foreground">Раздел воспоминаний доступен только в премиум версии.</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Воспоминания не добавлены</h3>
          <p className="text-muted-foreground">Хронология важных моментов жизни пока не заполнена.</p>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {memories.map((memory, index) => (
              <div key={memory.id} className="relative">
                {/* Timeline line */}
                {index < memories.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Memory content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        {/* Photo section - left side */}
                        {memory.photos && memory.photos.length > 0 && (
                          <div className="md:w-2/5 flex-shrink-0">
                            <div className="relative h-64 md:h-full group cursor-pointer">
                              <img
                                src={memory.photos[0].url}
                                alt={memory.photos[0].originalName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onClick={() => openLightbox(memory.photos, 0, memory.title)}
                              />
                              {memory.photos.length > 1 && (
                                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {memory.photos.length}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Text section - right side */}
                        <div className="flex-1 p-6">
                          <div className="mb-3">
                            <h3 className="text-xl font-semibold text-card-foreground mb-2">
                              {memory.title}
                            </h3>
                            <span className="text-sm text-muted-foreground block">
                              {formatDate(memory.date)}
                            </span>
                          </div>
                          
                          {memory.description && (
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {memory.description}
                            </p>
                          )}
                          
                          {/* Additional photos thumbnails */}
                          {memory.photos && memory.photos.length > 1 && (
                            <div className="mt-4 flex gap-2 flex-wrap">
                              {memory.photos.slice(1, 4).map((photo, photoIndex) => (
                                <div key={photo.id} className="group cursor-pointer">
                                  <img
                                    src={photo.thumbnailUrl || photo.url}
                                    alt={photo.originalName}
                                    className="w-16 h-16 object-cover rounded border-2 border-border group-hover:border-primary transition-colors"
                                    onClick={() => openLightbox(memory.photos, photoIndex + 1, memory.title)}
                                  />
                                </div>
                              ))}
                              {memory.photos.length > 4 && (
                                <div 
                                  className="w-16 h-16 bg-muted rounded border-2 border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => openLightbox(memory.photos, 4, memory.title)}
                                >
                                  <span className="text-sm font-medium text-muted-foreground">
                                    +{memory.photos.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Загрузка...' : 'Показать еще'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={handleLightboxNext}
        onPrevious={handleLightboxPrevious}
      />
    </div>
  );
};

export default MemorialMemories;