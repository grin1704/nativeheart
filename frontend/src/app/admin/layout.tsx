'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.data);
      } else {
        localStorage.removeItem('adminToken');
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminToken');
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminUser(null);
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login page without layout
  if (pathname === '/admin/login') {
    return children;
  }

  // Redirect to login if not authenticated
  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Административная панель
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {adminUser.name} ({adminUser.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4">
              <ul className="space-y-2">
                <li>
                  <a
                    href="/admin"
                    className={`block px-4 py-2 text-sm rounded-md ${
                      pathname === '/admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Дашборд
                  </a>
                </li>
                {hasPermission(adminUser, 'users', 'read') && (
                  <li>
                    <a
                      href="/admin/users"
                      className={`block px-4 py-2 text-sm rounded-md ${
                        pathname.startsWith('/admin/users')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Пользователи
                    </a>
                  </li>
                )}
                {hasPermission(adminUser, 'memorial_pages', 'read') && (
                  <li>
                    <a
                      href="/admin/memorial-pages"
                      className={`block px-4 py-2 text-sm rounded-md ${
                        pathname.startsWith('/admin/memorial-pages')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Памятные страницы
                    </a>
                  </li>
                )}
                {hasPermission(adminUser, 'moderation', 'read') && (
                  <li>
                    <a
                      href="/admin/moderation"
                      className={`block px-4 py-2 text-sm rounded-md ${
                        pathname.startsWith('/admin/moderation')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Модерация
                    </a>
                  </li>
                )}
                {hasPermission(adminUser, 'settings', 'read') && (
                  <li>
                    <a
                      href="/admin/settings"
                      className={`block px-4 py-2 text-sm rounded-md ${
                        pathname.startsWith('/admin/settings')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Настройки
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function hasPermission(
  adminUser: AdminUser,
  resource: string,
  action: string
): boolean {
  if (adminUser.role === 'super_admin') {
    return true;
  }

  return adminUser.permissions.some(
    p => p.resource === resource && p.actions.includes(action)
  );
}