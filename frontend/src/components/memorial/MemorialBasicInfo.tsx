'use client';

import React from 'react';

interface MemorialPageWithDetails {
  id: string;
  slug: string;
  fullName: string;
  birthDate: Date;
  deathDate: Date;
  mainPhoto?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

interface MemorialBasicInfoProps {
  memorialPage: MemorialPageWithDetails;
}

export const MemorialBasicInfo: React.FC<MemorialBasicInfoProps> = ({ memorialPage }) => {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: Date | string, deathDate: Date | string) => {
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    const age = death.getFullYear() - birth.getFullYear();
    const monthDiff = death.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const age = calculateAge(memorialPage.birthDate, memorialPage.deathDate);

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        {memorialPage.mainPhoto ? (
          <img
            src={memorialPage.mainPhoto.url}
            alt={memorialPage.fullName}
            className="mx-auto h-48 w-48 rounded-full object-cover shadow-lg"
          />
        ) : (
          <div className="mx-auto h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
            <svg className="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          {memorialPage.fullName}
        </h1>
        
        <p className="mt-2 text-lg text-gray-600">
          {formatDate(memorialPage.birthDate)} - {formatDate(memorialPage.deathDate)}
        </p>
        
        <p className="text-sm text-gray-500">
          Прожил {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Дата рождения
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(memorialPage.birthDate)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Дата смерти
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(memorialPage.deathDate)}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Страница создана {formatDate(memorialPage.createdAt)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Создатель: {memorialPage.owner.name}
        </p>
      </div>
    </div>
  );
};

export default MemorialBasicInfo;