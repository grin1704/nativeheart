'use client';

import { useState } from 'react';

interface DeleteMemorialDialogProps {
  memorialName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteMemorialDialog({ 
  memorialName, 
  onConfirm, 
  onCancel 
}: DeleteMemorialDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    if (confirmText !== 'УДАЛИТЬ') {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {step === 1 ? (
          // Step 1: Initial warning
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              Удалить памятную страницу?
            </h3>
            
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Вы собираетесь удалить страницу:
              </p>
              <p className="text-base font-semibold text-gray-900 bg-gray-50 p-3 rounded-md text-center">
                {memorialName}
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  ⚠️ Внимание! Это действие необратимо!
                </p>
                <p className="text-sm text-red-700">
                  Будут безвозвратно удалены все данные:
                </p>
                <ul className="mt-2 text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Биография и основная информация</li>
                  <li>Все фотографии и видео</li>
                  <li>Воспоминания и отзывы</li>
                  <li>Хронология событий</li>
                  <li>QR-код и ссылка на страницу</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-600 italic">
                Восстановление данных после удаления невозможно.
              </p>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleFirstConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Продолжить
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Final confirmation
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              Подтвердите удаление
            </h3>
            
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-700">
                Для подтверждения удаления введите слово <span className="font-bold">УДАЛИТЬ</span> в поле ниже:
              </p>
              
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Введите УДАЛИТЬ"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
              />
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-xs text-yellow-800">
                  Это последнее предупреждение. После нажатия кнопки "Удалить навсегда" все данные будут безвозвратно удалены.
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <button
                onClick={handleFinalConfirm}
                disabled={confirmText !== 'УДАЛИТЬ' || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Удаление...
                  </span>
                ) : (
                  'Удалить навсегда'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
