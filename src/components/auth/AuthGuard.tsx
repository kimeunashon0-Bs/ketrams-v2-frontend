'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage =
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/apply-institution') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/verify-otp') ||
      pathname.startsWith('/set-password');

    const isProtectedRoute =
      pathname.startsWith('/student') ||
      pathname.startsWith('/institution') ||
      pathname.startsWith('/subcounty') ||
      pathname.startsWith('/admin');

    // 1. Protected route but no user → redirect to login
    if (!user && isProtectedRoute) {
      router.replace('/login');
      return;
    }

    // 2. Auth page but user exists → redirect to appropriate dashboard
    if (user && isAuthPage) {
      const dashboardMap: Record<string, string> = {
        STUDENT: '/student/dashboard',
        INSTITUTION: '/institution/dashboard',
        SUB_COUNTY: '/subcounty/dashboard',
        ADMIN: '/admin/dashboard',
      };
      router.replace(dashboardMap[user.role] || '/');
      return;
    }

    // 3. Handle back‑forward cache (bfcache) – when page is restored from cache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page loaded from cache – re‑check auth
        if (!user && isProtectedRoute) {
          router.replace('/login');
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}