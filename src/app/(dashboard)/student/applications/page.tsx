"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { EyeIcon } from '@heroicons/react/24/outline';

interface Application {
  id: number;
  institution: { name: string };
  course: { name: string; level: string };
  status: string;
  appliedAt: string;
  institutionReviewedAt: string | null;
  subCountyReviewedAt: string | null;
  facilitationAmount: number | null;
  institutionRemarks: string | null;
  subCountyRemarks: string | null;
}

const statusColors: Record<string, string> = {
  PENDING_INSTITUTION: 'bg-yellow-100 text-yellow-800',
  APPROVED_BY_INSTITUTION: 'bg-green-100 text-green-800',
  REJECTED_BY_INSTITUTION: 'bg-red-100 text-red-800',
  PENDING_SUB_COUNTY: 'bg-blue-100 text-blue-800',
  VERIFIED: 'bg-purple-100 text-purple-800',
  FACILITATED: 'bg-indigo-100 text-indigo-800',
  NOT_FACILITATED: 'bg-gray-100 text-gray-800',
  WAITLISTED: 'bg-orange-100 text-orange-800',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/student/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">You haven't submitted any applications yet.</p>
            <a
              href="/student/applications/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start an Application
            </a>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {applications.map((app) => (
                <li key={app.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {app.institution.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {app.course.name} ({app.course.level})
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Applied: {formatDate(app.appliedAt)}</span>
                        {app.institutionReviewedAt && (
                          <span className="ml-2">• Reviewed: {formatDate(app.institutionReviewedAt)}</span>
                        )}
                        {app.subCountyReviewedAt && (
                          <span className="ml-2">• Sub-county: {formatDate(app.subCountyReviewedAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[app.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Details modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <p><span className="font-medium">Institution:</span> {selectedApp.institution.name}</p>
                <p><span className="font-medium">Course:</span> {selectedApp.course.name} ({selectedApp.course.level})</p>
                <p><span className="font-medium">Status:</span> {selectedApp.status.replace(/_/g, ' ')}</p>
                <p><span className="font-medium">Applied:</span> {formatDate(selectedApp.appliedAt)}</p>
                {selectedApp.institutionReviewedAt && (
                  <p><span className="font-medium">Institution Reviewed:</span> {formatDate(selectedApp.institutionReviewedAt)}</p>
                )}
                {selectedApp.subCountyReviewedAt && (
                  <p><span className="font-medium">Sub‑County Reviewed:</span> {formatDate(selectedApp.subCountyReviewedAt)}</p>
                )}
                {selectedApp.institutionRemarks && (
                  <p><span className="font-medium">Institution Remarks:</span> {selectedApp.institutionRemarks}</p>
                )}
                {selectedApp.subCountyRemarks && (
                  <p><span className="font-medium">Sub‑County Remarks:</span> {selectedApp.subCountyRemarks}</p>
                )}
                {selectedApp.facilitationAmount && (
                  <p><span className="font-medium">Facilitation Amount:</span> KES {selectedApp.facilitationAmount}</p>
                )}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
}