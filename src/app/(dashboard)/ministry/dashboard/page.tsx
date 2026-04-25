"use client";
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function MinistryDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ministry Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.fullName || 'Ministry Officer'}.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/ministry/institutions" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Manage Institutions</h2>
          <p className="text-gray-600">Add, edit, or delete institutions.</p>
        </Link>
        <Link href="/ministry/institution-users" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Manage Institution Users</h2>
          <p className="text-gray-600">Create or remove institution admin accounts.</p>
        </Link>
        <Link href="/ministry/staff" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Staff Records</h2>
          <p className="text-gray-600">View all staff across institutions.</p>
        </Link>
        <Link href="/ministry/assets" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Assets</h2>
          <p className="text-gray-600">View all assets across institutions.</p>
        </Link>
      </div>
    </div>
  );
}