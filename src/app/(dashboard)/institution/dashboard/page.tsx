"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/axios';
import InstitutionLayout from '@/components/layout/InstitutionLayout';

interface Stats {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  totalCourses: number;
}

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch applications
        const appsRes = await api.get('/institution/applications');
        const applications = appsRes.data.data || [];
        const pending = applications.filter((a: any) => a.status === 'PENDING_INSTITUTION').length;
        const approved = applications.filter((a: any) => a.status === 'APPROVED_BY_INSTITUTION').length;
        const rejected = applications.filter((a: any) => a.status === 'REJECTED_BY_INSTITUTION').length;

        // Fetch courses (we'll need an endpoint to list courses for the institution)
        // Assuming we have /institution/courses (protected) that returns courses for the logged-in institution
        const coursesRes = await api.get('/institution/courses');
        const totalCourses = coursesRes.data.length;

        setStats({
          totalApplications: applications.length,
          pending,
          approved,
          rejected,
          totalCourses,
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
    <InstitutionLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Institution Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalApplications}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pending}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.approved}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.rejected}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{stats.totalCourses}</dd>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/institution/applications"
                className="block w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
              >
                View Applications
              </Link>
              <Link
                href="/institution/courses"
                className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
              >
                Manage Courses
              </Link>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity.</p>
          </div>
        </div>
      </div>
    </InstitutionLayout>
  );
}