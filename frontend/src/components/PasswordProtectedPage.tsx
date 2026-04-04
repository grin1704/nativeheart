'use client';

import React, { useState, useEffect } from 'react';
import { usePasswordAccess } from '../hooks/usePasswordAccess';
import PasswordForm from './PasswordForm';

interface PasswordProtectedPageProps {
  pageId: string;
  children: React.ReactNode;
  onPasswordVerified?: () => void;
}

export const PasswordProtectedPage: React.FC<PasswordProtectedPageProps> = ({
  pageId,
  children,
  onPasswordVerified
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { verifyPassword, checkAccess, loading, error } = usePasswordAccess();

  useEffect(() => {
    const checkInitialAccess = async () => {
      try {
        const access = await checkAccess(pageId);
        setHasAccess(access);
        if (!access) {
          setShowPasswordForm(true);
        }
      } catch (err) {
        // If we can't check access, assume we need password
        setHasAccess(false);
        setShowPasswordForm(true);
      }
    };

    if (pageId) {
      checkInitialAccess();
    }
  }, [pageId, checkAccess]);

  const handlePasswordSubmit = async (password: string) => {
    const isValid = await verifyPassword(pageId, password);
    if (isValid) {
      setHasAccess(true);
      setShowPasswordForm(false);
      onPasswordVerified?.();
    }
  };

  // Show loading state while checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show password form if access is denied
  if (!hasAccess || showPasswordForm) {
    return (
      <PasswordForm
        onSubmit={handlePasswordSubmit}
        loading={loading}
        error={error ?? undefined}
      />
    );
  }

  // Show protected content if access is granted
  return <>{children}</>;
};

export default PasswordProtectedPage;