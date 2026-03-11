"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/axios';
import StudentLayout from '@/components/layout/StudentLayout';

interface Stats {
  profileCompleted: boolean;
  applicationsCount: number;
  pendingCount: number;
  approvedCount: number;
  facilitatedCount: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    profileCompleted: false,
    applicationsCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    facilitatedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if profile exists
        const profileRes = await api.get('/student/profile');
        const profileExists = profileRes.data.data !== null;

        // Get applications
        const appsRes = await api.get('/student/applications');
        const applications = appsRes.data.data || [];

        const pending = applications.filter((a: any) => a.status === 'PENDING_INSTITUTION').length;
        const approved = applications.filter((a: any) => a.status === 'APPROVED_BY_INSTITUTION').length;
        const facilitated = applications.filter((a: any) => a.status === 'FACILITATED').length;

        setStats({
          profileCompleted: profileExists,
          applicationsCount: applications.length,
          pendingCount: pending,
          approvedCount: approved,
          facilitatedCount: facilitated,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>

        {!stats.profileCompleted && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your profile is incomplete.{' '}
                  <Link href="/student/profile" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                    Complete it now
                  </Link>{' '}
                  to start applying.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.applicationsCount}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingCount}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.approvedCount}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Facilitated</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.facilitatedCount}</dd>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/student/institutions"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Browse Institutions
              </Link>
              <Link
                href="/student/applications/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                New Application
              </Link>
              <Link
                href="/student/applications"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                View My Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}