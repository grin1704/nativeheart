'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

interface MediaFile {
  id: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

interface GalleryItem {
  id: string;
  mediaFileId?: string;
  videoType?: 'upload' | 'vk' | 'rutube';
  externalUrl?: string;
  embedCode?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  orderIndex: number;
  createdAt: Date;
  mediaFile?: MediaFile;
}

interface GalleryData {
  items: GalleryItem[];
  hasAccess: boolean;
  subscriptionRequired: boolean;
}

interface MemorialGalleriesProps {
  memorialPageId: string;
}

export const MemorialGalleries: React.FC<MemorialGalleriesProps> = ({ memorialPageId }) => {
  const [photoGallery, setPhotoGallery] = useState<GalleryData | null>(null);
  const [videoGallery, setVideoGallery] = useState<GalleryData | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        
        const [photoResponse, videoResponse] = await Promise.all([
          apiRequest<GalleryData>('GET', `/gallery/${memorialPageId}/photos`),
          apiRequest<GalleryData>('GET', `/gallery/${memorialPageId}/videos`)
        ]);

        if (photoResponse.success) {
          setPhotoGallery(photoResponse.data || { items: [], hasAccess: false, subscriptionRequired: true });
        }
        
        if (videoResponse.success) {
          setVideoGallery(videoResponse.data || { items: [], hasAccess: false, subscriptionRequired: true });
        }
      } catch (err) {
        console.error('Error fetching galleries:', err);
        setError('Ошибка загрузки галерей');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, [memorialPageId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="flex space-x-4 mb-6">
            <div className="h-8 bg-muted rounded w-20"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
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

  const currentGallery = activeTab === 'photos' ? photoGallery : videoGallery;
  const hasPhotos = (photoGallery?.items?.length || 0) > 0;
  const hasVideos = (videoGallery?.items?.length || 0) > 0;

  // Check if galleries are available based on subscription
  const photoGalleryAvailable = photoGallery?.hasAccess !== false;
  const videoGalleryAvailable = videoGallery?.hasAccess !== false;
  const anyGalleryAvailable = photoGalleryAvailable || videoGalleryAvailable;

  // If no gallery access, show subscription required message
  if (!anyGalleryAvailable && (photoGallery?.subscriptionRequired || videoGallery?.subscriptionRequired)) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Фото и видео</h2>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Премиум функция</h3>
          <p className="text-muted-foreground">Фото и видео галереи доступны только в премиум версии.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Фото и видео</h2>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'photos'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          Фотографии {hasPhotos && `(${photoGallery?.items.length})`}
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'videos'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          Видео {hasVideos && `(${videoGallery?.items.length})`}
        </button>
      </div>

      {/* Gallery Content */}
      {currentGallery?.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {activeTab === 'photos' ? 'Фотографии не добавлены' : 'Видео не добавлены'}
          </h3>
          <p className="text-muted-foreground">
            {activeTab === 'photos' 
              ? 'Фотографии пока не загружены в галерею.' 
              : 'Видео пока не загружены в галерею.'
            }
          </p>
        </div>
      ) : (
        <div className={activeTab === 'photos' 
          ? "columns-1 sm:columns-2 md:columns-3 gap-4" 
          : "grid grid-cols-1 gap-4"
        }>
          {currentGallery?.items.map((item, index) => (
            <div key={item.id} className={activeTab === 'photos' ? "group mb-4 break-inside-avoid" : "group"}>
              {activeTab === 'photos' ? (
                <div 
                  className="cursor-pointer rounded-lg overflow-hidden relative"
                  onClick={() => setLightboxIndex(index)}
                >
                  {item.mediaFile && (
                    <>
                      {/* Skeleton placeholder */}
                      {!loadedImages.has(item.id) && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                      )}
                      
                      {/* Actual image - use thumbnail for faster loading */}
                      <img
                        src={item.mediaFile.thumbnailUrl || item.mediaFile.url}
                        alt={item.title || item.mediaFile.originalName}
                        className={`w-full h-auto shadow-sm group-hover:shadow-md transition-all duration-300 rounded-lg ${
                          loadedImages.has(item.id) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setLoadedImages(prev => new Set(prev).add(item.id));
                        }}
                        loading="lazy"
                      />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {item.videoType === 'upload' && item.mediaFile ? (
                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                      <video
                        src={item.mediaFile.url}
                        className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-sm group-hover:shadow-md transition-shadow bg-black"
                        controls
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full rounded-lg shadow-sm group-hover:shadow-md transition-shadow overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                      {item.embedCode ? (
                        <div 
                          className="absolute inset-0 w-full h-full"
                          dangerouslySetInnerHTML={{ __html: item.embedCode.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"') }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white text-sm">
                          {item.videoType === 'vk' ? 'Видео ВКонтакте' : 'Видео Rutube'}
                        </div>
                      )}
                    </div>
                  )}
                  {item.title && (
                    <h3 className="mt-3 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for photos */}
      {activeTab === 'photos' && lightboxIndex >= 0 && photoGallery && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          plugins={[Captions]}
          slides={photoGallery.items.filter(item => item.mediaFile).map(item => ({
            src: item.mediaFile!.url,
            alt: item.title || item.mediaFile!.originalName,
            title: item.title,
            description: item.description,
          }))}
        />
      )}
    </div>
  );
};

export default MemorialGalleries;