'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';

interface BiographyData {
  text: string;
  photos: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    originalName: string;
  }>;
}

interface MemorialPageWithDetails {
  id: string;
  biography?: BiographyData;
}

interface MemorialBiographyProps {
  memorialPage: MemorialPageWithDetails;
  ownerSubscriptionType: 'trial' | 'free' | 'premium';
}

export const MemorialBiography: React.FC<MemorialBiographyProps> = ({ 
  memorialPage, 
  ownerSubscriptionType 
}) => {
  const [biography, setBiography] = useState<BiographyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<BiographyData>(
          'GET',
          `/memorial-pages/${memorialPage.id}/biography`
        );

        if (response.success && response.data) {
          setBiography(response.data);
        } else {
          setBiography(null);
        }
      } catch (err) {
        console.error('Error fetching biography:', err);
        setError('Ошибка загрузки биографии');
      } finally {
        setLoading(false);
      }
    };

    fetchBiography();
  }, [memorialPage.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
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

  if (!biography || !biography.text) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Биография не добавлена</h3>
        <p className="text-muted-foreground">Информация о жизни пока не заполнена.</p>
      </div>
    );
  }

  // Подсчет символов без HTML тегов
  const getTextLength = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent?.length || 0;
  };
  
  const textLength = getTextLength(biography.text);
  const isTextTruncated = ownerSubscriptionType === 'free' && textLength > 1000;
  
  // Обрезаем текст по символам, а не по HTML
  let displayText = biography.text;
  if (isTextTruncated) {
    const tmp = document.createElement('div');
    tmp.innerHTML = biography.text;
    const plainText = tmp.textContent || '';
    const truncatedPlainText = plainText.substring(0, 1000) + '...';
    displayText = truncatedPlainText;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Биография</h2>
      
      <div className="prose prose-lg max-w-none">
        <div 
          className="text-muted-foreground leading-relaxed biography-content"
          dangerouslySetInnerHTML={{ __html: displayText }}
        />
        
        {isTextTruncated && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-primary text-sm">
              <strong>Текст сокращен.</strong> В бесплатной версии доступно только первые 1000 символов биографии.
              Полная биография доступна в платной версии сервиса.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .biography-content :global(h1) {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .biography-content :global(h2) {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.875rem;
          color: #1f2937;
        }
        
        .biography-content :global(h3) {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        
        .biography-content :global(p) {
          margin-bottom: 1rem;
        }
        
        .biography-content :global(ul),
        .biography-content :global(ol) {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .biography-content :global(li) {
          margin-bottom: 0.5rem;
        }
        
        .biography-content :global(blockquote) {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
        }
        
        .biography-content :global(strong) {
          font-weight: 600;
          color: #111827;
        }
        
        .biography-content :global(em) {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default MemorialBiography;