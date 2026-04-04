'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/utils/api';

interface CreateMemorialPageForm {
  fullName: string;
  birthDate: string;
  deathDate: string;
  isPrivate: boolean;
  password?: string;
}

export default function CreateMemorialPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CreateMemorialPageForm>();

  const isPrivate = watch('isPrivate');

  const onSubmit = async (data: CreateMemorialPageForm) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/memorial-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          birthDate: data.birthDate,
          deathDate: data.deathDate,
          isPrivate: data.isPrivate || false,
          ...(data.isPrivate && data.password && { password: data.password }),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка создания страницы');
      }

      // Перенаправляем в дашборд
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Создание памятной страницы</h1>
              <p className="text-gray-600">Заполните основную информацию</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Назад к панели
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {error && (
              <div className={`border rounded-md p-4 ${
                error.includes('подтвердить email') 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {error.includes('подтвердить email') ? (
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={error.includes('подтвердить email') ? 'text-yellow-700' : 'text-red-600'}>
                      {error}
                    </p>
                    {error.includes('подтвердить email') && (
                      <p className="mt-2 text-sm text-yellow-600">
                        Проверьте вашу почту и перейдите по ссылке подтверждения, или{' '}
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard')}
                          className="font-medium underline hover:text-yellow-500"
                        >
                          вернитесь в панель управления
                        </button>
                        {' '}для повторной отправки письма.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Полное имя *
              </label>
              <input
                type="text"
                id="fullName"
                {...register('fullName', {
                  required: 'Полное имя обязательно для заполнения',
                  minLength: {
                    value: 2,
                    message: 'Имя должно содержать минимум 2 символа'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите полное имя"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                Дата рождения *
              </label>
              <input
                type="date"
                id="birthDate"
                {...register('birthDate', {
                  required: 'Дата рождения обязательна для заполнения',
                  validate: (value) => {
                    const birthDate = new Date(value);
                    const today = new Date();
                    if (birthDate >= today) {
                      return 'Дата рождения не может быть в будущем';
                    }
                    return true;
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Death Date */}
            <div>
              <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-2">
                Дата смерти *
              </label>
              <input
                type="date"
                id="deathDate"
                {...register('deathDate', {
                  required: 'Дата смерти обязательна для заполнения',
                  validate: (value) => {
                    const deathDate = new Date(value);
                    const today = new Date();
                    if (deathDate > today) {
                      return 'Дата смерти не может быть в будущем';
                    }
                    return true;
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.deathDate && (
                <p className="mt-1 text-sm text-red-600">{errors.deathDate.message}</p>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки приватности</h3>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isPrivate"
                    type="checkbox"
                    {...register('isPrivate')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isPrivate" className="font-medium text-gray-700">
                    Сделать страницу приватной
                  </label>
                  <p className="text-gray-500">
                    Приватные страницы требуют пароль для просмотра
                  </p>
                </div>
              </div>

              {isPrivate && (
                <div className="mt-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль для доступа *
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: isPrivate ? 'Пароль обязателен для приватных страниц' : false,
                      minLength: {
                        value: 4,
                        message: 'Пароль должен содержать минимум 4 символа'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите пароль"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Что будет дальше?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      После создания страницы вы сможете добавить биографию, фотографии, 
                      воспоминания и другую информацию. Все функции будут доступны в 
                      зависимости от вашего тарифного плана.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание...' : 'Создать страницу'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}