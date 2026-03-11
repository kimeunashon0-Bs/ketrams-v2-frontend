"use client";
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      if (user.role === 'STUDENT') router.replace('/student/dashboard');
      else if (user.role === 'INSTITUTION') router.replace('/institution/dashboard');
      else if (user.role === 'SUB_COUNTY') router.replace('/subcounty/dashboard');
      else router.replace('/login');
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}