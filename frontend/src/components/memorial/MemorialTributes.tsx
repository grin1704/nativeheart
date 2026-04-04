'use client';

import React, { useState, useEffect } from 'react';
import { TributeForm } from './TributeForm';
import { apiRequest } from '@/utils/api';
import { Lightbox } from '@/components/Lightbox';

interface MediaFile {
  id: string;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
}

interface Tribute {
  id: string;
  memorialPageId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  photo?: MediaFile;
  isApproved: boolean;
  likesCount: number;
  createdAt: Date;
}

interface TributesResponse {
  success: boolean;
  data: Tribute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MemorialTributesProps {
  memorialPageId: string;
}

export const MemorialTributes: React.FC<MemorialTributesProps> = ({ memorialPageId }) => {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string; alt?: string } | null>(null);

  // Likes state
  const [likedTributes, setLikedTributes] = useState<Set<string>>(new Set());
  const [fingerprint, setFingerprint] = useState<string>('');

  // Generate fingerprint on mount
  useEffect(() => {
    const generateFingerprint = () => {
      const nav = navigator as any;
      const screen = window.screen;
      const data = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset()
      ].join('|');
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    };

    const fp = generateFingerprint();
    setFingerprint(fp);

    // Load liked tributes from localStorage
    const stored = localStorage.getItem(`liked_tributes_${fp}`);
    if (stored) {
      setLikedTributes(new Set(JSON.parse(stored)));
    }
  }, []);

  const fetchTributes = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await apiRequest<TributesResponse>(
        'GET',
        `/memorial-pages/${memorialPageId}/tributes?page=${pageNum}&limit=10&approved=true`
      );

      if (response.success && response.data) {
        const tributesData = Array.isArray(response.data) ? response.data : response.data.data || [];
        const paginationData = response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
        
        if (pageNum === 1) {
          setTributes(tributesData);
        } else {
          setTributes(prev => [...prev, ...tributesData]);
        }
        setHasMore(paginationData.page < paginationData.totalPages);
      } else {
        setTributes([]);
      }
    } catch (err) {
      console.error('Error fetching tributes:', err);
      setError('Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTributes(page);
  }, [memorialPageId, page]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleTributeSubmitted = () => {
    setShowForm(false);
    // Refresh tributes list
    setPage(1);
    fetchTributes(1);
  };

  const openLightbox = (photo: MediaFile) => {
    setLightboxImage({
      url: photo.url,
      alt: photo.originalName
    });
    setLightboxOpen(true);
  };

  const handleLike = async (tributeId: string) => {
    if (!fingerprint) return;

    const isLiked = likedTributes.has(tributeId);
    console.log('=== HANDLE LIKE CLICKED ===');
    console.log('Tribute ID:', tributeId);
    console.log('Is already liked:', isLiked);
    console.log('Fingerprint:', fingerprint);
    console.log('Liked tributes set:', Array.from(likedTributes));

    try {
      if (isLiked) {
        // Unlike
        const response = await apiRequest<{ likesCount: number; isLiked: boolean }>(
          'DELETE',
          `/tributes/${tributeId}/like?fingerprint=${fingerprint}`
        );

        console.log('Unlike response:', response);

        if (response.success && response.data) {
          setLikedTributes(prev => {
            const newSet = new Set(prev);
            newSet.delete(tributeId);
            localStorage.setItem(`liked_tributes_${fingerprint}`, JSON.stringify(Array.from(newSet)));
            return newSet;
          });

          setTributes(prev => prev.map(t => 
            t.id === tributeId ? { ...t, likesCount: response.data!.likesCount } : t
          ));
        }
      } else {
        // Like
        const response = await apiRequest<{ likesCount: number; isLiked: boolean }>(
          'POST',
          `/tributes/${tributeId}/like`,
          { fingerprint }
        );

        console.log('Like response:', response);
        console.log('Tribute ID:', tributeId);
        console.log('New likes count:', response.data?.likesCount);

        if (response.success && response.data) {
          setLikedTributes(prev => {
            const newSet = new Set(prev);
            newSet.add(tributeId);
            localStorage.setItem(`liked_tributes_${fingerprint}`, JSON.stringify(Array.from(newSet)));
            return newSet;
          });

          console.log('Updating tributes state...');
          setTributes(prev => {
            console.log('Current tributes:', prev);
            const updated = prev.map(t => {
              if (t.id === tributeId) {
                console.log('Found tribute to update:', t);
                console.log('Old likesCount:', t.likesCount);
                console.log('New likesCount:', response.data!.likesCount);
                return { ...t, likesCount: response.data!.likesCount };
              }
              return t;
            });
            console.log('Updated tributes:', updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Слова близких</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Отменить' : 'Оставить отзыв'}
        </button>
      </div>

      {/* Tribute Form */}
      {showForm && (
        <div className="mb-8">
          <TributeForm
            memorialPageId={memorialPageId}
            onSubmitted={handleTributeSubmitted}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Tributes List */}
      {tributes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Отзывы не оставлены</h3>
          <p className="text-muted-foreground mb-4">Станьте первым, кто поделится воспоминаниями.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Оставить отзыв
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {tributes.map((tribute) => {
            const isLiked = likedTributes.has(tribute.id);
            console.log(`Rendering tribute ${tribute.id}, likesCount: ${tribute.likesCount}`);
            
            return (
              <div key={tribute.id} className="bg-card border border-border rounded-lg p-6 shadow-sm relative">
                {/* Date in top left */}
                <div className="text-xs text-muted-foreground mb-4">
                  {formatDate(tribute.createdAt)}
                </div>
                
                {/* Like button in top right */}
                <button
                  onClick={() => handleLike(tribute.id)}
                  className="absolute top-4 right-4 flex items-center gap-1.5 group transition-all"
                  aria-label={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 18 18" 
                    fill={isLiked ? "#95C6B4" : "none"}
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-all group-hover:scale-110"
                  >
                    <g clipPath="url(#clip0_2148_701)">
                      <path 
                        d="M14.625 9.42877L8.99998 14.9998L3.37498 9.42877C3.00396 9.06773 2.71171 8.63378 2.51664 8.15424C2.32157 7.67471 2.2279 7.15998 2.24153 6.64247C2.25517 6.12495 2.3758 5.61587 2.59585 5.14727C2.8159 4.67867 3.13058 4.26071 3.5201 3.9197C3.90961 3.5787 4.36551 3.32203 4.85909 3.16588C5.35267 3.00972 5.87324 2.95745 6.38801 3.01237C6.90278 3.06728 7.40061 3.22818 7.85014 3.48495C8.29967 3.74171 8.69117 4.08877 8.99998 4.50427C9.31013 4.09178 9.70208 3.74776 10.1513 3.49372C10.6005 3.23968 11.0974 3.0811 11.6107 3.02791C12.124 2.97471 12.6428 3.02804 13.1346 3.18456C13.6263 3.34108 14.0805 3.59742 14.4686 3.93754C14.8568 4.27766 15.1706 4.69423 15.3903 5.16119C15.61 5.62814 15.731 6.13543 15.7457 6.6513C15.7604 7.16717 15.6684 7.68051 15.4756 8.1592C15.2827 8.6379 14.9932 9.07163 14.625 9.43327" 
                        stroke="#95C6B4" 
                        strokeWidth="1.125" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2148_701">
                        <rect width="18" height="18" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  {tribute.likesCount > 0 && (
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {tribute.likesCount}
                    </span>
                  )}
                </button>
                
                {/* Tribute text */}
                <p className="text-muted-foreground whitespace-pre-wrap mb-4 pr-12">
                  {tribute.text}
                </p>
                
                {/* Author name in bottom right */}
                <div className="text-right text-sm font-medium text-card-foreground mb-3">
                  {tribute.authorName}
                </div>
                
                {/* Photo if exists */}
                {tribute.photo && (
                  <div className="mt-3">
                    <img
                      src={tribute.photo.thumbnailUrl || tribute.photo.url}
                      alt="Фото к отзыву"
                      className="max-w-xs h-32 object-cover rounded-md shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all"
                      onClick={() => openLightbox(tribute.photo!)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          images={[lightboxImage]}
          currentIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default MemorialTributes;