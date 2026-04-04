'use client';

import { useState, useEffect } from 'react';
import { X, Mail, UserPlus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface CollaboratorPermissions {
  basicInfo: boolean;
  biography: boolean;
  gallery: boolean;
  memories: boolean;
  timeline: boolean;
  tributes: boolean;
  burialLocation: boolean;
}

interface Collaborator {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  permissions: CollaboratorPermissions;
  invitedAt: string;
  acceptedAt: string | null;
}

interface CollaboratorsEditorProps {
  memorialPage: {
    id: string;
    ownerId: string;
  };
  user: {
    id: string;
  } | null;
  onUpdate?: (updates: any) => void;
  onError?: (error: string) => void;
}

const PERMISSION_LABELS: Record<keyof CollaboratorPermissions, string> = {
  basicInfo: 'Основная информация',
  biography: 'Биография',
  gallery: 'Галерея',
  memories: 'Воспоминания',
  timeline: 'Хронология',
  tributes: 'Отзывы',
  burialLocation: 'Место захоронения',
};

const DEFAULT_PERMISSIONS: CollaboratorPermissions = {
  basicInfo: true,
  biography: true,
  gallery: true,
  memories: true,
  timeline: true,
  tributes: true,
  burialLocation: true,
};

export default function CollaboratorsEditor({ memorialPage, user }: CollaboratorsEditorProps) {
  const memorialPageId = memorialPage.id;
  const isOwner = user?.id === memorialPage.ownerId;
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<CollaboratorPermissions>(DEFAULT_PERMISSIONS);
  const [showPermissions, setShowPermissions] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCollaborator, setEditingCollaborator] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<CollaboratorPermissions | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, [memorialPageId]);

  const loadCollaborators = async () => {
    try {
      const response = await fetch(`/api/memorial-pages/${memorialPageId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviting(true);

    try {
      const response = await fetch(`/api/memorial-pages/${memorialPageId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          permissions: invitePermissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Приглашение отправлено');
        setInviteEmail('');
        setInvitePermissions(DEFAULT_PERMISSIONS);
        setShowPermissions(false);
        loadCollaborators();
      } else {
        setError(data.message || 'Ошибка при отправке приглашения');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!confirm('Удалить редактора?')) return;

    try {
      const response = await fetch(
        `/api/memorial-pages/${memorialPageId}/collaborators/${collaboratorId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setSuccess('Редактор удален');
        loadCollaborators();
      } else {
        const data = await response.json();
        setError(data.message || 'Ошибка при удалении');
      }
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  const handleUpdatePermissions = async (collaboratorId: string, permissions: CollaboratorPermissions) => {
    try {
      const response = await fetch(
        `/api/memorial-pages/${memorialPageId}/collaborators/${collaboratorId}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );

      if (response.ok) {
        setSuccess('Права обновлены');
        setEditingCollaborator(null);
        loadCollaborators();
      } else {
        const data = await response.json();
        setError(data.message || 'Ошибка при обновлении прав');
      }
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  const togglePermission = (key: keyof CollaboratorPermissions) => {
    setInvitePermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const startEditingCollaborator = (collaboratorId: string) => {
    const collab = collaborators.find(c => c.id === collaboratorId);
    if (!collab) return;
    
    setEditingCollaborator(collaboratorId);
    setEditingPermissions({ ...collab.permissions });
  };

  const cancelEditingCollaborator = () => {
    setEditingCollaborator(null);
    setEditingPermissions(null);
  };

  const saveCollaboratorPermissions = async (collaboratorId: string) => {
    if (!editingPermissions) return;
    
    await handleUpdatePermissions(collaboratorId, editingPermissions);
    setEditingCollaborator(null);
    setEditingPermissions(null);
  };

  const toggleEditingPermission = (key: keyof CollaboratorPermissions) => {
    if (!editingPermissions) return;
    
    setEditingPermissions(prev => ({
      ...prev!,
      [key]: !prev![key]
    }));
  };

  const selectAllPermissions = () => {
    setInvitePermissions(DEFAULT_PERMISSIONS);
  };

  const deselectAllPermissions = () => {
    setInvitePermissions({
      basicInfo: false,
      biography: false,
      gallery: false,
      memories: false,
      timeline: false,
      tributes: false,
      burialLocation: false,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-gray-500">Загрузка данных пользователя...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Редакторы страницы
        </h3>
        <p className="text-sm text-gray-600">
          Пригласите родственников для совместного наполнения страницы
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invite Form - Only for owner */}
      {isOwner ? (
        <form onSubmit={handleInvite} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email пользователя
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                {inviting ? 'Отправка...' : 'Пригласить'}
              </button>
            </div>
          </div>

          {/* Permissions Selection */}
          <div>
            <button
              type="button"
              onClick={() => setShowPermissions(!showPermissions)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {showPermissions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Настроить разделы для редактирования
            </button>

            {showPermissions && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >
                    Выбрать все
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllPermissions}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Снять все
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invitePermissions[key as keyof CollaboratorPermissions]}
                        onChange={() => togglePermission(key as keyof CollaboratorPermissions)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="text-sm">
            Только владелец страницы может приглашать редакторов.
          </p>
        </div>
      )}

      {/* Collaborators List */}
      <div className="space-y-3">
        {collaborators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Пока нет редакторов</p>
          </div>
        ) : (
          collaborators.map((collab) => (
            <div
              key={collab.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-700 font-semibold">
                      {collab.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{collab.user.name}</div>
                    <div className="text-sm text-gray-500">{collab.user.email}</div>
                    {!collab.acceptedAt && (
                      <div className="text-xs text-amber-600 mt-1">
                        Ожидает принятия приглашения
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && (
                    <>
                      {editingCollaborator === collab.id ? (
                        <>
                          <button
                            onClick={() => saveCollaboratorPermissions(collab.id)}
                            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={cancelEditingCollaborator}
                            className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditingCollaborator(collab.id)}
                            className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Настроить
                          </button>
                          <button
                            onClick={() => handleRemove(collab.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Удалить редактора"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Permissions Display/Edit */}
              {(editingCollaborator === collab.id || !isOwner) && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">Разделы для редактирования:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                      const isChecked = editingCollaborator === collab.id && editingPermissions
                        ? editingPermissions[key as keyof CollaboratorPermissions]
                        : collab.permissions[key as keyof CollaboratorPermissions];
                      
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isOwner && editingCollaborator === collab.id) {
                                toggleEditingPermission(key as keyof CollaboratorPermissions);
                              }
                            }}
                            disabled={!isOwner || editingCollaborator !== collab.id}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
