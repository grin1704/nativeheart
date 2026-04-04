'use client';

import { useState, useEffect } from 'react';
import { Mail, Check, X, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Invitation {
  id: string;
  memorialPageId: string;
  memorialPageName: string;
  inviterName: string;
  permissions: 'edit' | 'view';
  invitedAt: string;
}

export default function InvitationsPanel() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/my/invitations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    setProcessing(invitationId);
    try {
      const response = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        loadInvitations();
      }
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    if (!confirm('Отклонить приглашение?')) return;

    setProcessing(invitationId);
    try {
      const response = await fetch(`/api/invitations/${invitationId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        loadInvitations();
      }
    } catch (err) {
      console.error('Failed to decline invitation:', err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">Загрузка приглашений...</div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Приглашения к редактированию
        </h2>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
          {invitations.length}
        </span>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-memorial-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  {invitation.memorialPageName}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{invitation.inviterName}</span> приглашает вас к{' '}
                  {invitation.permissions === 'edit' ? 'редактированию' : 'просмотру'} страницы
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(invitation.invitedAt).toLocaleDateString('ru-RU')}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(invitation.id)}
                  disabled={processing === invitation.id}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Принять
                </button>
                <button
                  onClick={() => handleDecline(invitation.id)}
                  disabled={processing === invitation.id}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  <X className="w-4 h-4" />
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
