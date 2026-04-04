'use client';

import React from 'react';

interface SubscriptionFeatureGateProps {
  subscriptionType: 'trial' | 'free' | 'premium';
  requiredTypes: ('trial' | 'free' | 'premium')[];
  featureName: string;
  children: React.ReactNode;
}

export const SubscriptionFeatureGate: React.FC<SubscriptionFeatureGateProps> = ({
  subscriptionType,
  requiredTypes,
  featureName,
  children
}) => {
  const hasAccess = requiredTypes.includes(subscriptionType);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="p-8 text-center">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {featureName} недоступны
      </h3>
      
      <p className="text-gray-600 mb-4">
        Раздел "{featureName}" доступен только в платной версии сервиса.
      </p>
      
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Что включает платная версия:</p>
        <ul className="text-left space-y-1">
          <li>• Неограниченная биография</li>
          <li>• Фото и видео галереи</li>
          <li>• Хронология воспоминаний</li>
          <li>• Отзывы и слова близких</li>
          <li>• Совместное редактирование</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionFeatureGate;