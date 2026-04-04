'use client';

import { useState } from 'react';
import ChangeEmailDialog from './ChangeEmailDialog';

interface EmailVerificationBannerProps {
  userEmail: string;
  onRefresh?: () => void;
}

export default function EmailVerificationBanner({ userEmail, onRefresh }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Письмо отправлено! Проверьте вашу почту.');
      } else {
        // If email is already verified, refresh the page
        if (data.error && data.error.includes('уже подтвержден')) {
          setMessage('Email уже подтвержден! Обновляем страницу...');
          setTimeout(() => {
            if (onRefresh) {
              onRefresh();
            } else {
              window.location.reload();
            }
          }, 1000);
        } else {
          setMessage(data.error || 'Ошибка отправки письма');
        }
      }
    } catch (error) {
      setMessage('Произошла ошибка при отправке письма');
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailChanged = () => {
    setMessage('Email успешно изменен! Проверьте новый адрес.');
    setTimeout(() => {
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    }, 2000);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <ChangeEmailDialog
        isOpen={showChangeEmailDialog}
        onClose={() => setShowChangeEmailDialog(false)}
        currentEmail={userEmail}
        onSuccess={handleEmailChanged}
      />
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Email не подтвержден.</span> Пожалуйста, проверьте вашу почту{' '}
            <span className="font-medium">{userEmail}</span> и перейдите по ссылке подтверждения.
            {' '}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="font-medium underline hover:text-yellow-600 disabled:opacity-50"
            >
              {isResending ? 'Отправка...' : 'Отправить письмо повторно'}
            </button>
            {' или '}
            <button
              onClick={() => {
                if (onRefresh) {
                  onRefresh();
                } else {
                  window.location.reload();
                }
              }}
              className="font-medium underline hover:text-yellow-600"
            >
              обновить страницу
            </button>
          </p>
          {message && (
            <p className={`text-sm mt-2 ${message.includes('Ошибка') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={() => setIsDismissed(true)}
            className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none"
          >
            <span className="sr-only">Закрыть</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
