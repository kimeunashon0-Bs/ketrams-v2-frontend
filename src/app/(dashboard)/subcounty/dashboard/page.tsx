"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/axios';
import SubCountyLayout from '@/components/layout/SubCountyLayout';

interface Stats {
  totalApplications: number;
  pendingVerification: number;
  verified: number;
  facilitated: number;
  notFacilitated: number;
  waitlisted: number;
}

export default function SubCountyDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    pendingVerification: 0,
    verified: 0,
    facilitated: 0,
    notFacilitated: 0,
    waitlisted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/subcounty/applications');
        const applications = response.data.data || [];
        setStats({
          totalApplications: applications.length,
          pendingVerification: applications.filter((a: any) => a.status === 'PENDING_SUB_COUNTY' || a.status === 'APPROVED_BY_INSTITUTION').length,
          verified: applications.filter((a: any) => a.status === 'VERIFIED').length,
          facilitated: applications.filter((a: any) => a.status === 'FACILITATED').length,
          notFacilitated: applications.filter((a: any) => a.status === 'NOT_FACILITATED').length,
          waitlisted: applications.filter((a: any) => a.status === 'WAITLISTED').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <SubCountyLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Sub‑County Dashboard</h1>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalApplications}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingVerification}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Verified</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.verified}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Facilitated</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.facilitated}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Not Facilitated</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-600">{stats.notFacilitated}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Waitlisted</dt>
              <dd className="mt-1 text-3xl font-semibold text-orange-600">{stats.waitlisted}</dd>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/subcounty/applications"
                className="block w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
              >
                Review Applications
              </Link>
              <Link
                href="/subcounty/reports"
                className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
              >
                View Reports
              </Link>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Sub‑County</h2>
            <p className="text-gray-600">{user?.subCounty || 'Not assigned'}</p>
          </div>
        </div>
      </div>
    </SubCountyLayout>
  );
}