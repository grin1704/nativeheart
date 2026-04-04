'use client';

import { useState } from 'react';
import type { User } from '@/types';

interface SubscriptionStatusProps {
  user: User;
  onSubscriptionChange: (newType: 'trial' | 'free' | 'premium') => Promise<void>;
}

export default function SubscriptionStatus({ user, onSubscriptionChange }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);

  const getSubscriptionInfo = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'trial':
        return {
          name: 'Пробный период',
          description: 'Полный доступ ко всем функциям',
          color: 'blue',
          features: [
            'Неограниченная биография',
            'Фото и видео галереи',
            'Воспоминания',
            'Отзывы близких',
            'Совместное редактирование',
            'Все остальные функции'
          ]
        };
      case 'premium':
        return {
          name: 'Премиум',
          description: 'Полный доступ ко всем функциям',
          color: 'green',
          features: [
            'Неограниченная биография',
            'Фото и видео галереи',
            'Воспоминания',
            'Отзывы близких',
            'Совместное редактирование',
            'Приоритетная поддержка'
          ]
        };
      case 'free':
      default:
        return {
          name: 'Бесплатный',
          description: 'Базовые функции',
          color: 'gray',
          features: [
            'Основная информация',
            'Биография до 1000 символов',
            'Место захоронения',
            'QR-код'
          ]
        };
    }
  };

  const handleSubscriptionChange = async (newType: 'trial' | 'free' | 'premium') => {
    setLoading(true);
    try {
      await onSubscriptionChange(newType);
    } finally {
      setLoading(false);
    }
  };

  const subscriptionInfo = getSubscriptionInfo(user.subscriptionType);
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      button: 'bg-green-600 hover:bg-green-700 text-white'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-800',
      button: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  };

  const colors = colorClasses[subscriptionInfo.color as keyof typeof colorClasses];

  return (
    <div className={`rounded-lg border p-6 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Текущий тариф</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
              {subscriptionInfo.name}
            </span>
            {user.subscriptionExpiresAt && (
              <span className="text-sm text-gray-600">
                до {new Date(user.subscriptionExpiresAt).toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{subscriptionInfo.description}</p>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Доступные функции:</h4>
        <ul className="space-y-1">
          {subscriptionInfo.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Test buttons for subscription management */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Управление подпиской (для тестирования):</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSubscriptionChange('trial')}
            disabled={loading || user.subscriptionType === 'trial'}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              user.subscriptionType === 'trial'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Пробный период
          </button>
          <button
            onClick={() => handleSubscriptionChange('free')}
            disabled={loading || user.subscriptionType === 'free'}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              user.subscriptionType === 'free'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Бесплатный
          </button>
          <button
            onClick={() => handleSubscriptionChange('premium')}
            disabled={loading || user.subscriptionType === 'premium'}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              user.subscriptionType === 'premium'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Премиум
          </button>
        </div>
        {loading && (
          <p className="text-sm text-gray-600 mt-2">Обновление подписки...</p>
        )}
      </div>

      {user.subscriptionType === 'free' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Ограниченный функционал
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  В бесплатном тарифе доступны только базовые функции. 
                  Обновите подписку для получения полного доступа.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}