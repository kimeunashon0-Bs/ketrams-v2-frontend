"use client";
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function TreasuryDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Treasury Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.fullName || 'Treasury Officer'}.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/treasury/applications" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Applications</h2>
          <p className="text-gray-600">Review student applications.</p>
        </Link>
        <Link href="/treasury/reports" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Reports</h2>
          <p className="text-gray-600">Generate reports.</p>
        </Link>
        <Link href="/treasury/staff" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Staff Records</h2>
          <p className="text-gray-600">View staff in your sub‑county.</p>
        </Link>
        <Link href="/treasury/assets" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Assets</h2>
          <p className="text-gray-600">View assets in your sub‑county.</p>
        </Link>
      </div>
    </div>
  );
}