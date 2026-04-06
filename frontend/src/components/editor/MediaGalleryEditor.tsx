'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import type { MemorialPage, User, MediaFile, ExternalVideoInfo } from '@/types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageCropper from './ImageCropper';
import ExternalVideoDialog from './ExternalVideoDialog';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

interface MediaGalleryEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

interface GalleryItem {
  id: string;
  mediaFileId: string;
  title?: string;
  description?: string;
  orderIndex: number;
  mediaFile: MediaFile;
}

interface SortablePhotoItemProps {
  item: GalleryItem;
  onDelete: (id: string) => void;
  onEdit: (item: GalleryItem) => void;
  onCrop: (item: GalleryItem) => void;
  onClick: () => void;
}

function SortablePhotoItem({ item, onDelete, onEdit, onCrop, onClick }: SortablePhotoItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="cursor-move absolute top-2 left-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Перетащите для изменения порядка"
      >
        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <div className="relative w-full">
        {/* Skeleton placeholder */}
        {!imageLoaded && (
          <div className="w-full bg-gray-200 animate-pulse rounded-lg" style={{ aspectRatio: '4/3' }} />
        )}
        
        {/* Actual image */}
        <img
          src={item.mediaFile.thumbnailUrl || item.mediaFile.url}
          alt={item.title || item.mediaFile.originalName}
          className={`w-full h-auto rounded-lg border border-gray-200 cursor-pointer transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClick}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
      
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCrop(item);
          }}
          className="p-1 bg-green-600 text-white rounded-full hover:bg-green-700"
          title="Кадрировать"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          title="Редактировать подпись"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          title="Удалить фото"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface SortableVideoItemProps {
  item: GalleryItem;
  onDelete: (id: string) => void;
  onEdit: (item: GalleryItem) => void;
}

function SortableVideoItem({ item, onDelete, onEdit }: SortableVideoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="cursor-move absolute top-2 left-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Перетащите для изменения порядка"
      >
        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      {(item as any).videoType === 'upload' && (item as any).mediaFile ? (
        <video
          src={(item as any).mediaFile.url}
          className="w-full rounded-lg border border-gray-200 object-contain bg-black"
          style={{ aspectRatio: '16/9' }}
          preload="metadata"
        />
      ) : (
        <div className="w-full rounded-lg border border-gray-200 overflow-hidden bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          {(item as any).embedCode ? (
            <div 
              className="w-full h-full pointer-events-none"
              dangerouslySetInnerHTML={{ __html: (item as any).embedCode.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"') }}
            />
          ) : (
            <div className="text-white text-sm">
              {(item as any).videoType === 'vk' ? 'Видео ВКонтакте' : 'Видео Rutube'}
            </div>
          )}
        </div>
      )}
      
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          title="Редактировать подпись"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          title="Удалить видео"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {item.title && (
        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          {item.title}
        </h3>
      )}
    </div>
  );
}

export default function MediaGalleryEditor({ memorialPage, user, onUpdate, onError }: MediaGalleryEditorProps) {
  const [photoGallery, setPhotoGallery] = useState<GalleryItem[]>([]);
  const [videoGallery, setVideoGallery] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [hasAccess, setHasAccess] = useState(true);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [croppingItem, setCroppingItem] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [showExternalVideoDialog, setShowExternalVideoDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Check access based on API response, not user subscription
  const isPremiumFeature = !hasAccess && subscriptionRequired;

  useEffect(() => {
    loadGalleries();
  }, [memorialPage.id]);

  const loadGalleries = async () => {
    try {
      // Load photo gallery
      const photoResponse = await apiRequest<any>('GET', `/gallery/${memorialPage.id}/photos`);
      if (photoResponse.success && photoResponse.data) {
        const items = (photoResponse.data.items || []).sort((a: GalleryItem, b: GalleryItem) => 
          a.orderIndex - b.orderIndex
        );
        setPhotoGallery(items);
        setHasAccess(photoResponse.data.hasAccess !== false);
        setSubscriptionRequired(photoResponse.data.subscriptionRequired === true);
      } else if (photoResponse.error && photoResponse.error.includes('доступен только в платной версии')) {
        setHasAccess(false);
        setSubscriptionRequired(true);
      }

      // Load video gallery
      const videoResponse = await apiRequest<any>('GET', `/gallery/${memorialPage.id}/videos`);
      if (videoResponse.success && videoResponse.data) {
        const items = (videoResponse.data.items || []).sort((a: GalleryItem, b: GalleryItem) => 
          a.orderIndex - b.orderIndex
        );
        setVideoGallery(items);
        if (!hasAccess) {
          setHasAccess(videoResponse.data.hasAccess !== false);
          setSubscriptionRequired(videoResponse.data.subscriptionRequired === true);
        }
      }
    } catch (err) {
      console.error('Error loading galleries:', err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const isPhoto = activeTab === 'photos';
    const items = isPhoto ? [...photoGallery] : [...videoGallery];
    const setItems = isPhoto ? setPhotoGallery : setVideoGallery;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      orderIndex: index,
    }));

    // Update UI immediately
    setItems(newItems);
    
    // Mark as having unsaved changes
    setHasUnsavedOrder(true);
  };

  const handleSaveOrder = async () => {
    const isPhoto = activeTab === 'photos';
    const items = isPhoto ? photoGallery : videoGallery;

    console.log('💾 Сохранение порядка:', items.map(i => ({ id: i.id, orderIndex: i.orderIndex })));

    setSavingOrder(true);
    try {
      // Обновляем последовательно, чтобы избежать конфликтов
      for (const item of items) {
        console.log(`📤 Обновление ${item.id} → orderIndex: ${item.orderIndex}`);
        const result = await apiRequest('PUT', `/gallery/${memorialPage.id}/${isPhoto ? 'photos' : 'videos'}/${item.id}`, {
          orderIndex: item.orderIndex,
        });
        
        if (!result.success) {
          console.error(`❌ Ошибка обновления ${item.id}:`, result.error);
          onError(`Ошибка сохранения: ${result.error}`);
          return;
        }
      }
      
      console.log('✅ Все обновления завершены');
      
      setHasUnsavedOrder(false);
      
      // Перезагрузить галерею для проверки
      await loadGalleries();
      console.log('✅ Галерея перезагружена');
    } catch (err) {
      console.error('❌ Ошибка сохранения порядка:', err);
      onError('Ошибка сохранения порядка');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleCancelOrder = async () => {
    setHasUnsavedOrder(false);
    await loadGalleries(); // Reload original order
  };

  const handleCropPhoto = (item: GalleryItem) => {
    setCropperImage(item.mediaFile.url);
    setCropperFile(null);
    setCroppingItem(item);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperImage(null);
    
    if (!croppingItem) return;
    
    // Only used for editing existing photos
    const croppedFile = new File([croppedBlob], croppingItem.mediaFile.originalName, {
      type: 'image/jpeg',
    });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('type', 'gallery_photo');
      formData.append('memorialPageId', memorialPage.id);

      const uploadResponse = await fetch(`/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const uploadResult = await uploadResponse.json();
      
      if (uploadResult.success) {
        await apiRequest('PUT', `/gallery/${memorialPage.id}/photos/${croppingItem.id}`, {
          mediaFileId: uploadResult.data.id,
        });
        
        await loadGalleries();
      } else {
        onError('Ошибка загрузки обрезанного фото');
      }
    } catch (err) {
      onError('Ошибка обработки фото');
    } finally {
      setUploading(false);
      setCroppingItem(null);
    }
  };

  const handleEditItem = (item: GalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const isPhoto = activeTab === 'photos';
    try {
      const response = await apiRequest('PUT', `/gallery/${memorialPage.id}/${isPhoto ? 'photos' : 'videos'}/${editingItem.id}`, {
        title: editTitle,
        description: editDescription,
      });

      if (response.success) {
        const items = isPhoto ? photoGallery : videoGallery;
        const setItems = isPhoto ? setPhotoGallery : setVideoGallery;
        
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { ...item, title: editTitle, description: editDescription }
            : item
        ));
        
        setEditingItem(null);
        setEditTitle('');
        setEditDescription('');
      } else {
        onError(response.error || 'Ошибка сохранения');
      }
    } catch (err) {
      onError('Ошибка сохранения');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const isPhoto = type === 'photo';
    const validTypes = isPhoto ? ['image/'] : ['video/'];
    const invalidFiles = files.filter(file => !validTypes.some(validType => file.type.startsWith(validType)));
    
    if (invalidFiles.length > 0) {
      onError(`Можно загружать только ${isPhoto ? 'изображения' : 'видео'}`);
      return;
    }

    // Validate file sizes
    const maxSize = isPhoto ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for photos, 100MB for videos
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      onError(`Размер каждого файла не должен превышать ${isPhoto ? '10MB' : '100MB'}`);
      return;
    }

    // Upload files directly without cropping
    await uploadFiles(files, type);
    
    // Reset input
    event.target.value = '';
  };



  const uploadFileWithProgress = (file: File, isPhoto: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isPhoto ? 'gallery_photo' : 'gallery_video');
      formData.append('memorialPageId', memorialPage.id);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({
            ...prev,
            current: prev.current,
            percent: percentComplete
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (err) {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', `/api/media/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    });
  };

  const uploadFiles = async (files: File[], type: 'photo' | 'video') => {
    const isPhoto = type === 'photo';
    
    try {
      setUploading(true);
      setUploadProgress({ current: 0, total: files.length, percent: 0 });
      
      const results = [];
      
      // Upload files sequentially to show progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length, percent: 0 });
        setUploadStatus('uploading');
        
        try {
          const uploadResult = await uploadFileWithProgress(file, isPhoto);
          
          if (uploadResult.success) {
            // Показываем статус обработки после загрузки
            setUploadStatus('processing');
            setUploadProgress(prev => ({ ...prev, percent: 100 }));
            
            const addToGalleryResponse = await apiRequest('POST', `/gallery/${memorialPage.id}/${isPhoto ? 'photos' : 'videos'}`, {
              mediaFileId: uploadResult.data.id,
              title: file.name.split('.')[0],
            });
            results.push(addToGalleryResponse);
          } else {
            console.error('Upload failed:', uploadResult.error);
            results.push(uploadResult);
          }
        } catch (err) {
          console.error('File upload error:', err);
          results.push({ success: false });
        }
      }

      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        onError(`Не удалось загрузить ${failedUploads.length} файл(ов)`);
      }

      if (successfulUploads.length > 0) {
        await loadGalleries();
      }
    } catch (err) {
      onError(`Ошибка загрузки ${isPhoto ? 'фотографий' : 'видео'}`);
    } finally {
      setUploading(false);
      setUploadStatus(null);
      setUploadProgress({ current: 0, total: 0, percent: 0 });
    }
  };

  const handleAddExternalVideo = async (videoInfo: ExternalVideoInfo & { title?: string; description?: string }) => {
    try {
      setUploading(true);
      
      const payload = {
        videoType: videoInfo.videoType,
        externalUrl: videoInfo.externalUrl,
        embedCode: videoInfo.embedCode,
        thumbnailUrl: videoInfo.thumbnailUrl,
        title: videoInfo.title,
        description: videoInfo.description,
      };
      
      console.log('📤 Отправка внешнего видео:', payload);
      
      const response = await apiRequest<any>('POST', `/gallery/${memorialPage.id}/videos`, payload);

      console.log('📥 Ответ сервера:', response);

      if (response.success) {
        await loadGalleries();
        setShowExternalVideoDialog(false);
      } else {
        console.error('❌ Ошибка добавления:', response.error);
        onError(response.error || 'Не удалось добавить видео');
      }
    } catch (err: any) {
      console.error('❌ Исключение:', err);
      onError(err.message || 'Ошибка добавления видео');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (itemId: string, type: 'photo' | 'video') => {
    try {
      const response = await apiRequest('DELETE', `/gallery/${memorialPage.id}/${type === 'photo' ? 'photos' : 'videos'}/${itemId}`);
      if (response.success) {
        if (type === 'photo') {
          setPhotoGallery(prev => prev.filter(item => item.id !== itemId));
        } else {
          setVideoGallery(prev => prev.filter(item => item.id !== itemId));
        }
      } else {
        onError(response.error || 'Ошибка удаления файла');
      }
    } catch (err) {
      onError('Ошибка удаления файла');
    }
  };

  if (isPremiumFeature) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Премиум функция</h3>
          <p className="mt-1 text-sm text-gray-500">
            Фото и видео галереи доступны только в премиум версии.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Обновить подписку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Фото и видео галереи</h2>
        <p className="text-sm text-gray-600">
          Создайте коллекцию фотографий и видео для сохранения визуальных воспоминаний.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'photos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Фотографии ({photoGallery.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Видео ({videoGallery.length})
          </button>
        </nav>
      </div>

      {/* Photo Gallery Tab */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">Фотогалерея</h3>
              <div>
                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'photo')}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="photoUpload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Добавить фото
                    </>
                  )}
                </label>
              </div>
            </div>
            
            {/* Upload Progress */}
            {uploading && uploadProgress.total > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {uploadStatus === 'processing' ? (
                      <>
                        <svg className="inline-block animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Обработка фото {uploadProgress.current} из {uploadProgress.total}...
                      </>
                    ) : (
                      `Загрузка фото ${uploadProgress.current} из ${uploadProgress.total}`
                    )}
                  </span>
                  <span className="text-sm text-blue-700">
                    {uploadStatus === 'processing' ? 'Загрузка в облако...' : `${uploadProgress.percent}%`}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${uploadStatus === 'processing' ? 'animate-pulse' : ''}`}
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {photoGallery.length > 0 ? (
            <>
              {hasUnsavedOrder ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">
                        Порядок изменен. Сохраните изменения.
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelOrder}
                        disabled={savingOrder}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveOrder}
                        disabled={savingOrder}
                        className="px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingOrder ? 'Сохранение...' : 'Сохранить порядок'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
                  <strong>Совет:</strong> Перетаскивайте фото для изменения порядка отображения
                </div>
              )}
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={photoGallery.map(item => item.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {photoGallery.map((item, index) => (
                      <SortablePhotoItem
                        key={item.id}
                        item={item}
                        onDelete={(id) => handleFileDelete(id, 'photo')}
                        onEdit={handleEditItem}
                        onCrop={handleCropPhoto}
                        onClick={() => setLightboxIndex(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mt-2">Нет фотографий</p>
              <p className="text-sm text-gray-400">Добавьте фотографии в галерею</p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Максимальный размер файла: 10MB. Поддерживаемые форматы: JPG, PNG, GIF. Фото будет обрезано перед загрузкой.
          </p>
        </div>
      )}

      {/* Video Gallery Tab */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">Видеогалерея</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowExternalVideoDialog(true)}
                  disabled={uploading}
                  className={`inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  По ссылке
                </button>
                <input
                  type="file"
                  id="videoUpload"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'video')}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="videoUpload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Загрузить файл
                    </>
                  )}
                </label>
              </div>
            </div>
            
            {/* Upload Progress */}
            {uploading && uploadProgress.total > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {uploadStatus === 'processing' ? (
                      <>
                        <svg className="inline-block animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Обработка видео {uploadProgress.current} из {uploadProgress.total}...
                      </>
                    ) : (
                      `Загрузка видео ${uploadProgress.current} из ${uploadProgress.total}`
                    )}
                  </span>
                  <span className="text-sm text-blue-700">
                    {uploadStatus === 'processing' ? 'Загрузка в облако...' : `${uploadProgress.percent}%`}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${uploadStatus === 'processing' ? 'animate-pulse' : ''}`}
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {videoGallery.length > 0 ? (
            <>
              {hasUnsavedOrder ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">
                        Порядок изменен. Сохраните изменения.
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelOrder}
                        disabled={savingOrder}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveOrder}
                        disabled={savingOrder}
                        className="px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingOrder ? 'Сохранение...' : 'Сохранить порядок'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
                  <strong>Совет:</strong> Перетаскивайте видео для изменения порядка отображения
                </div>
              )}
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={videoGallery.map(item => item.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 gap-4">
                    {videoGallery.map((item) => (
                      <SortableVideoItem
                        key={item.id}
                        item={item}
                        onDelete={(id) => handleFileDelete(id, 'video')}
                        onEdit={handleEditItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mt-2">Нет видео</p>
              <p className="text-sm text-gray-400">Добавьте видео в галерею</p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Максимальный размер файла: 100MB. Поддерживаемые форматы: MP4, AVI, MOV, WMV.
          </p>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperImage(null);
            setCropperFile(null);
            setCroppingItem(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setEditingItem(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Редактировать фото
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите название фото"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Добавьте описание к фото"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSaveEdit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          plugins={[Captions]}
          slides={photoGallery.map(item => ({
            src: item.mediaFile.url,
            alt: item.title || item.mediaFile.originalName,
            title: item.title,
            description: item.description,
          }))}
        />
      )}

      {/* External Video Dialog */}
      <ExternalVideoDialog
        isOpen={showExternalVideoDialog}
        onClose={() => setShowExternalVideoDialog(false)}
        onAdd={handleAddExternalVideo}
      />
    </div>
  );
}