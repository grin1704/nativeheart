'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { MemorialPage } from '@/types';

interface MemorialHeroProps {
  memorialPage: {
    fullName: string;
    birthDate: string;
    deathDate: string;
    birthPlace?: string | null;
    mainPhoto?: {
      url: string;
      thumbnailUrl?: string;
    } | null;
  };
  quote?: string;
}

export const MemorialHero: React.FC<MemorialHeroProps> = ({ 
  memorialPage,
  quote = "В сердцах тех, кто любил, память живёт вечно"
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      setShowStickyHeader(rect.bottom <= 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const birthYear = new Date(memorialPage.birthDate).getFullYear();
  const deathYear = new Date(memorialPage.deathDate).getFullYear();
  const birthDateFull = formatFullDate(memorialPage.birthDate);
  const deathDateFull = formatFullDate(memorialPage.deathDate);
  const location = memorialPage.birthPlace || '';

  return (
    <>
      {/* Hero Section */}
      <header 
        ref={heroRef}
        className="relative border-b border-border"
        style={{
          backgroundImage: memorialPage.mainPhoto?.url 
            ? `url(${memorialPage.mainPhoto.url})`
            : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div 
          className="bg-background/80 backdrop-blur-sm"
          style={{
            backgroundColor: 'hsl(var(--memorial-hero-overlay))',
          }}
        >
          <div className="mx-auto flex min-h-[100vh] max-w-4xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground/80">
              Светлой памяти
            </p>
            
            {/* Photo */}
            <div className="h-52 w-52 overflow-hidden rounded-2xl border-2 border-border bg-muted shadow-lg md:h-64 md:w-64">
              {memorialPage.mainPhoto ? (
                <img
                  src={memorialPage.mainPhoto.thumbnailUrl || memorialPage.mainPhoto.url}
                  alt={memorialPage.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <svg 
                    className="h-24 w-24 text-muted-foreground/40" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Name and Dates */}
            <div className="space-y-3">
              <div className="mt-2">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[2.9rem]">
                  {memorialPage.fullName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground md:text-base">
                  <svg 
                    className="h-4 w-4 md:h-5 md:w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                    <path d="M16 3l0 4"></path>
                    <path d="M8 3l0 4"></path>
                    <path d="M4 11l16 0"></path>
                    <path d="M8 15h2v2h-2z"></path>
                  </svg>
                  <span>{birthDateFull} — {deathDateFull}</span>
                </div>
                {location && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground md:text-base">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </div>
                )}
              </div>
              
              {/* Quote */}
              {quote && (
                <p className="memorial-prose-muted mx-auto max-w-2xl text-sm italic md:text-base">
                  "{quote}"
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Header */}
      <div 
        className={`sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur transition-all duration-300 ${
          showStickyHeader
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0 hidden'
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {/* Small Photo */}
            <div className="h-12 w-12 overflow-hidden rounded-xl border border-border bg-muted">
              {memorialPage.mainPhoto ? (
                <img
                  src={memorialPage.mainPhoto.thumbnailUrl || memorialPage.mainPhoto.url}
                  alt={memorialPage.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg 
                    className="h-6 w-6 text-muted-foreground/40" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Name and Dates */}
            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-semibold text-foreground md:text-base">
                {memorialPage.fullName}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
                <svg 
                  className="h-3 w-3" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                  <path d="M16 3l0 4"></path>
                  <path d="M8 3l0 4"></path>
                  <path d="M4 11l16 0"></path>
                  <path d="M8 15h2v2h-2z"></path>
                </svg>
                <span>{birthDateFull} — {deathDateFull}</span>
                {location && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
