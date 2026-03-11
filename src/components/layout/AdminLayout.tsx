"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  InboxIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '@/lib/api/axios';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Institutions', href: '/admin/institutions', icon: BuildingOfficeIcon },
  { name: 'Institution Users', href: '/admin/institution-users', icon: UsersIcon },
  { name: 'Requests', href: '/admin/institution-requests', icon: InboxIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    checkPendingRequests();
    const interval = setInterval(checkPendingRequests, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const checkPendingRequests = async () => {
    try {
      const response = await api.get('/admin/institution-requests');
      const pending = response.data.filter((req: any) => req.status === 'PENDING').length;
      setHasPending(pending > 0);
    } catch (error) {
      console.error('Failed to fetch pending count', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white shadow-lg`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-5 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user?.phoneNumber}</p>
            <p className="text-xs text-gray-500 capitalize">Administrator</p>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Requests' && hasPending && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-2 py-4 border-t">
            <button
              onClick={logout}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-3">
              {/* Username removed from header to avoid duplication with sidebar */}
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}