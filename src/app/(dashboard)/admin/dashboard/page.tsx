"use client";
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/institutions" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Manage Institutions</h2>
          <p className="text-gray-600">Add, edit, or delete institutions.</p>
        </Link>
        <Link href="/admin/institution-users" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Manage Institution Users</h2>
          <p className="text-gray-600">Create or remove institution admin accounts.</p>
        </Link>
      </div>
    </div>
  );
}