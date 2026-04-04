'use client';

import React, { useState } from 'react';
import { MemorialHero } from './memorial/MemorialHero';
import { MemorialBiography } from './memorial/MemorialBiography';
import { MemorialGalleries } from './memorial/MemorialGalleries';
import { MemorialMemories } from './memorial/MemorialMemories';
import { MemorialTributes } from './memorial/MemorialTributes';
import { MemorialBurialLocation } from './memorial/MemorialBurialLocation';
import { MemorialQRCode } from './memorial/MemorialQRCode';
import MemorialTimeline from './memorial/MemorialTimeline';
import type { MemorialPage } from '@/types';

interface MemorialPageWithDetails extends MemorialPage {
  owner: {
    id: string;
    name: string;
    email: string;
    subscriptionType?: 'trial' | 'free' | 'premium';
  };
  mainPhoto?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
  } | null;
  biography?: {
    text: string;
    photos: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      originalName: string;
    }>;
  };
  _count: {
    memories: number;
    tributes: number;
    mediaFiles: number;
    photoGallery: number;
    videoGallery: number;
  };
}

interface MemorialPageViewProps {
  memorialPage: MemorialPageWithDetails;
}

export const MemorialPageView: React.FC<MemorialPageViewProps> = ({ memorialPage }) => {
  const [activeSection, setActiveSection] = useState('biography');
  const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const menuItemRefs = React.useRef<Record<string, HTMLLIElement | null>>({});
  const menuContainerRef = React.useRef<HTMLUListElement>(null);
  
  // Get owner's subscription type to determine feature access
  const ownerSubscriptionType = memorialPage.owner.subscriptionType || 'free';
  
  const sections = [
    { 
      id: 'biography', 
      name: 'Биография',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2z"></path>
          <path d="M12 5v16"></path>
          <path d="M7 7h1"></path>
          <path d="M7 11h1"></path>
          <path d="M16 7h1"></path>
          <path d="M16 11h1"></path>
          <path d="M16 15h1"></path>
        </svg>
      )
    },
    { 
      id: 'timeline', 
      name: 'Хронология',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M10 20h-6"></path>
          <path d="M14 20h6"></path>
          <path d="M12 15l-2 -2h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h10a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-3l-2 2z"></path>
        </svg>
      )
    },
    { 
      id: 'galleries', 
      name: 'Галерея',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 8h.01"></path>
          <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"></path>
          <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"></path>
          <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"></path>
        </svg>
      ),
      requiresSubscription: true 
    },
    { 
      id: 'memories', 
      name: 'Воспоминания',
      icon: (
        <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3497 14.8631L11.7207 15.7166C11.6723 15.7418 11.618 15.753 11.5636 15.749C11.5093 15.7451 11.4571 15.7261 11.4129 15.6942C11.3687 15.6623 11.3342 15.6187 11.3134 15.5684C11.2925 15.5181 11.286 15.4629 11.2947 15.4091L11.6059 13.6008L10.2882 12.3206C10.2489 12.2826 10.221 12.2343 10.2078 12.1812C10.1946 12.1281 10.1966 12.0723 10.2136 12.0203C10.2306 11.9683 10.2618 11.9221 10.3038 11.887C10.3458 11.8519 10.3968 11.8294 10.4509 11.8218L12.2719 11.5578L13.0864 9.9131C13.1108 9.86411 13.1483 9.82289 13.1949 9.79408C13.2414 9.76527 13.295 9.75 13.3497 9.75C13.4044 9.75 13.458 9.76527 13.5045 9.79408C13.551 9.82289 13.5886 9.86411 13.6129 9.9131L14.4274 11.5578L16.2484 11.8218C16.3025 11.8296 16.3532 11.8524 16.395 11.8875C16.4368 11.9226 16.4679 11.9687 16.4849 12.0206C16.5018 12.0725 16.5039 12.1281 16.4908 12.1811C16.4778 12.2341 16.4502 12.2825 16.4112 12.3206L15.0934 13.6008L15.4039 15.4083C15.4133 15.4622 15.4073 15.5177 15.3867 15.5684C15.3661 15.619 15.3317 15.6629 15.2874 15.695C15.2431 15.7271 15.1907 15.7461 15.1361 15.75C15.0816 15.7538 15.027 15.7422 14.9787 15.7166L13.3497 14.8631Z" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.65047 14.8631L3.02147 15.7166C2.97313 15.7418 2.91875 15.753 2.86439 15.749C2.81004 15.7451 2.75785 15.7261 2.71366 15.6942C2.66948 15.6623 2.63502 15.6187 2.61415 15.5684C2.59328 15.5181 2.58681 15.4629 2.59547 15.4091L2.90672 13.6008L1.58897 12.3206C1.54964 12.2826 1.52179 12.2343 1.5086 12.1812C1.49542 12.1281 1.49742 12.0723 1.51439 12.0203C1.53136 11.9683 1.56262 11.9221 1.60458 11.887C1.64655 11.8519 1.69753 11.8294 1.75172 11.8218L3.57272 11.5578L4.38722 9.9131C4.41158 9.86411 4.44912 9.82289 4.49563 9.79408C4.54214 9.76527 4.59576 9.75 4.65047 9.75C4.70518 9.75 4.7588 9.76527 4.80531 9.79408C4.85182 9.82289 4.88936 9.86411 4.91372 9.9131L5.72822 11.5578L7.54922 11.8218C7.60325 11.8296 7.65403 11.8524 7.69581 11.8875C7.73759 11.9226 7.76871 11.9687 7.78564 12.0206C7.80258 12.0725 7.80465 12.1281 7.79163 12.1811C7.77861 12.2341 7.75102 12.2825 7.71197 12.3206L6.39422 13.6008L6.70472 15.4083C6.71404 15.4622 6.70806 15.5177 6.68746 15.5684C6.66685 15.619 6.63245 15.6629 6.58816 15.695C6.54388 15.7271 6.49147 15.7461 6.43691 15.75C6.38234 15.7538 6.3278 15.7422 6.27947 15.7166L4.65047 14.8631Z" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.00008 7.3631L7.37108 8.2166C7.32274 8.24176 7.26835 8.25299 7.214 8.24903C7.15965 8.24507 7.10746 8.22609 7.06327 8.19419C7.01909 8.16229 6.98463 8.11874 6.96376 8.0684C6.94289 8.01806 6.93642 7.9629 6.94508 7.9091L7.25633 6.10085L5.93858 4.8206C5.89925 4.78257 5.8714 4.73426 5.85821 4.68116C5.84503 4.62807 5.84703 4.57234 5.864 4.52033C5.88097 4.46833 5.91223 4.42214 5.95419 4.38704C5.99615 4.35194 6.04714 4.32935 6.10133 4.32185L7.92233 4.05785L8.73683 2.4131C8.76119 2.36411 8.79873 2.32289 8.84524 2.29408C8.89175 2.26527 8.94537 2.25 9.00008 2.25C9.05479 2.25 9.10841 2.26527 9.15492 2.29408C9.20143 2.32289 9.23897 2.36411 9.26333 2.4131L10.0778 4.05785L11.8988 4.32185C11.9529 4.32962 12.0036 4.35236 12.0454 4.38749C12.0872 4.42262 12.1183 4.46873 12.1353 4.52063C12.1522 4.57252 12.1543 4.62812 12.1412 4.68113C12.1282 4.73414 12.1006 4.78245 12.0616 4.8206L10.7438 6.10085L11.0543 7.90835C11.0637 7.96225 11.0577 8.01768 11.0371 8.06835C11.0165 8.11902 10.9821 8.1629 10.9378 8.195C10.8935 8.22711 10.8411 8.24615 10.7865 8.24997C10.732 8.25378 10.6774 8.24222 10.6291 8.2166L9.00008 7.3631Z" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      requiresSubscription: true 
    },
    { 
      id: 'tributes', 
      name: 'Слова близких',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 9h8"></path>
          <path d="M8 13h6"></path>
          <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"></path>
        </svg>
      ),
      requiresSubscription: true 
    },
    { 
      id: 'burial', 
      name: 'Место захоронения',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 21h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4"></path>
          <path d="M16 3v4"></path>
          <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z"></path>
          <path d="M19 18v.01"></path>
          <path d="M8 3v4"></path>
          <path d="M4 11h16"></path>
        </svg>
      )
    },
    { 
      id: 'qr', 
      name: 'QR-код',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
          <path d="M7 17l0 .01"></path>
          <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
          <path d="M7 7l0 .01"></path>
          <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
          <path d="M17 7l0 .01"></path>
          <path d="M14 14l3 0"></path>
          <path d="M20 14l0 .01"></path>
          <path d="M14 14l0 3"></path>
          <path d="M14 20l3 0"></path>
          <path d="M17 17l3 0"></path>
          <path d="M20 17l0 3"></path>
        </svg>
      )
    },
  ];

  // Show all sections - components will handle subscription checks internally
  const availableSections = sections;

  // Intersection Observer for auto-detecting active section
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section that is most visible in the viewport
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            // Sort by intersection ratio, but also consider position
            const ratioA = a.intersectionRatio;
            const ratioB = b.intersectionRatio;
            if (Math.abs(ratioA - ratioB) < 0.1) {
              // If ratios are similar, prefer the one closer to top
              return a.boundingClientRect.top - b.boundingClientRect.top;
            }
            return ratioB - ratioA;
          });
        
        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0],
        rootMargin: '-100px 0px -50% 0px',
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-scroll menu to show active item on mobile
  React.useEffect(() => {
    const activeMenuItem = menuItemRefs.current[activeSection];
    const menuContainer = menuContainerRef.current;
    
    if (activeMenuItem && menuContainer) {
      const menuRect = menuContainer.getBoundingClientRect();
      const itemRect = activeMenuItem.getBoundingClientRect();
      
      // Check if item is outside visible area
      const isOutOfView = 
        itemRect.left < menuRect.left || 
        itemRect.right > menuRect.right;
      
      if (isOutOfView) {
        // Calculate scroll position to center the active item
        const scrollLeft = 
          activeMenuItem.offsetLeft - 
          menuContainer.offsetWidth / 2 + 
          activeMenuItem.offsetWidth / 2;
        
        menuContainer.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSection]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const yOffset = -80; // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <MemorialHero 
        memorialPage={{
          fullName: memorialPage.fullName,
          birthDate: memorialPage.birthDate.toString(),
          deathDate: memorialPage.deathDate.toString(),
          birthPlace: null,
          mainPhoto: memorialPage.mainPhoto,
        }}
      />

      {/* Private Page Indicator */}
      {memorialPage.isPrivate && (
        <div className="border-b border-border bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Приватная страница
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Navigation */}
      <nav className="sticky top-[65px] z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <ul 
            ref={menuContainerRef}
            className="memorial-no-scrollbar flex items-center justify-start gap-2 overflow-x-auto scroll-smooth md:justify-center"
          >
            {availableSections.map((section) => (
              <li 
                key={section.id}
                ref={(el) => { menuItemRefs.current[section.id] = el; }}
              >
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 transition-all ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="h-[18px] w-[18px] flex-shrink-0">
                    {section.icon}
                  </span>
                  <span className="text-sm font-medium">
                    {section.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Biography Section */}
          <section
            id="biography"
            ref={(el) => { sectionRefs.current['biography'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialBiography 
              memorialPage={memorialPage}
              ownerSubscriptionType={ownerSubscriptionType}
            />
          </section>

          {/* Timeline Section */}
          <section
            id="timeline"
            ref={(el) => { sectionRefs.current['timeline'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialTimeline memorialPageId={memorialPage.id} />
          </section>

          {/* Galleries Section */}
          <section
            id="galleries"
            ref={(el) => { sectionRefs.current['galleries'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialGalleries memorialPageId={memorialPage.id} />
          </section>

          {/* Memories Section */}
          <section
            id="memories"
            ref={(el) => { sectionRefs.current['memories'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialMemories memorialPageId={memorialPage.id} />
          </section>

          {/* Tributes Section */}
          <section
            id="tributes"
            ref={(el) => { sectionRefs.current['tributes'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialTributes memorialPageId={memorialPage.id} />
          </section>

          {/* Burial Location Section */}
          <section
            id="burial"
            ref={(el) => { sectionRefs.current['burial'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialBurialLocation memorialPageId={memorialPage.id} />
          </section>

          {/* QR Code Section */}
          <section
            id="qr"
            ref={(el) => { sectionRefs.current['qr'] = el; }}
            className="scroll-mt-32"
          >
            <MemorialQRCode memorialPageId={memorialPage.id} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default MemorialPageView;