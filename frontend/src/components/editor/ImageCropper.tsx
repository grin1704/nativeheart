'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel,
  aspectRatio 
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);
  const [aspectMode, setAspectMode] = useState<'free' | '1:1' | '4:3' | '16:9'>('free');
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(undefined);
  
  // Use proxy for external images to avoid CORS issues
  const getProxiedImageUrl = (url: string) => {
    // Check if it's an external URL (Yandex Cloud, etc.)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Don't proxy localhost URLs
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return url;
      }
      // Proxy external URLs
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    // Local URLs don't need proxying
    return url;
  };
  
  const proxiedImage = getProxiedImageUrl(image);

  const handleAspectChange = (mode: 'free' | '1:1' | '4:3' | '16:9') => {
    setAspectMode(mode);
    
    switch (mode) {
      case 'free':
        setCurrentAspect(undefined);
        break;
      case '1:1':
        setCurrentAspect(1);
        break;
      case '4:3':
        setCurrentAspect(4 / 3);
        break;
      case '16:9':
        setCurrentAspect(16 / 9);
        break;
    }
  };

  const createCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    setProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={currentAspect}
        >
          <img
            ref={imgRef}
            src={proxiedImage}
            alt="Crop"
            style={{ maxHeight: '70vh', maxWidth: '100%' }}
          />
        </ReactCrop>
      </div>
      
      <div className="bg-white p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 w-24">Пропорции:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAspectChange('free')}
              className={`px-3 py-1 text-sm rounded ${
                aspectMode === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Свободно
            </button>
            <button
              onClick={() => handleAspectChange('1:1')}
              className={`px-3 py-1 text-sm rounded ${
                aspectMode === '1:1'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              1:1
            </button>
            <button
              onClick={() => handleAspectChange('4:3')}
              className={`px-3 py-1 text-sm rounded ${
                aspectMode === '4:3'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              4:3
            </button>
            <button
              onClick={() => handleAspectChange('16:9')}
              className={`px-3 py-1 text-sm rounded ${
                aspectMode === '16:9'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              16:9
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={createCroppedImage}
            disabled={processing || !completedCrop}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Обработка...' : 'Применить'}
          </button>
        </div>
      </div>
    </div>
  );
}

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}
