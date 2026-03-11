"use client";
import { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import api from '@/lib/api/axios';
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Application {
  id: number;
  student: {
    userId: number;
    fullName: string;
    idNumber: string;
    subCounty: string;
    ward: string;
    gender: string;
    disabilityStatus: string;
  };
  course: {
    name: string;
    level: string;
  };
  status: string;
  appliedAt: string;
  institutionRemarks: string | null;
}

interface StudentProfile {
  userId: number;
  fullName: string;
  gender: string;
  disabilityStatus: string;
  disabilityType?: string;
  idNumber: string;
  birthCertNumber: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string;
  county: string;
  subCounty: string;
  ward: string;
  previousSchool: string;
  highestQualification: string;
  documentUrls?: string[];
}

const statusColors: Record<string, string> = {
  PENDING_INSTITUTION: 'bg-yellow-100 text-yellow-800',
  APPROVED_BY_INSTITUTION: 'bg-green-100 text-green-800',
  REJECTED_BY_INSTITUTION: 'bg-red-100 text-red-800',
};

export default function InstitutionApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Student profile modal state
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institution/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await api.post(`/institution/applications/${selectedApp.id}/approve?remarks=${encodeURIComponent(remarks)}`);
      await fetchApplications();
      setSelectedApp(null);
      setRemarks('');
    } catch (error) {
      console.error('Failed to approve', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!remarks.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/institution/applications/${selectedApp.id}/reject?remarks=${encodeURIComponent(remarks)}`);
      await fetchApplications();
      setSelectedApp(null);
      setRemarks('');
    } catch (error) {
      console.error('Failed to reject', error);
    } finally {
      setActionLoading(false);
    }
  };

  const viewStudentProfile = async (studentId: number) => {
    setProfileLoading(true);
    try {
      const response = await api.get(`/institution/students/${studentId}`);
      setSelectedStudentProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch student profile', error);
      alert('Could not load student profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <InstitutionLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="PENDING_INSTITUTION">Pending</option>
            <option value="APPROVED_BY_INSTITUTION">Approved</option>
            <option value="REJECTED_BY_INSTITUTION">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No applications found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredApps.map((app) => (
                <li key={app.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {app.student.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {app.course.name} ({app.course.level})
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>ID: {app.student.idNumber}</span>
                        <span className="mx-2">•</span>
                        <span>{app.student.subCounty} / {app.student.ward}</span>
                        <span className="mx-2">•</span>
                        <span>Applied: {format(new Date(app.appliedAt), 'dd MMM yyyy')}</span>
                      </div>
                      {app.institutionRemarks && (
                        <p className="mt-1 text-xs text-gray-600">Remark: {app.institutionRemarks}</p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[app.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      {app.status === 'PENDING_INSTITUTION' && (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="ml-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={() => viewStudentProfile(app.student.userId)}
                        className="ml-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Review modal (unchanged) */}
        {selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Review Application</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <p><span className="font-medium">Student:</span> {selectedApp.student.fullName}</p>
                <p><span className="font-medium">Course:</span> {selectedApp.course.name} ({selectedApp.course.level})</p>
                <p><span className="font-medium">Applied:</span> {format(new Date(selectedApp.appliedAt), 'dd MMM yyyy')}</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remarks (required for rejection)</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Add remarks..."
                  />
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Profile Modal */}
        {selectedStudentProfile && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Student Profile</h2>
                <button
                  onClick={() => setSelectedStudentProfile(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {profileLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium text-gray-700">Personal Information</h3>
                      <p><span className="text-gray-600">Full Name:</span> {selectedStudentProfile.fullName}</p>
                      <p><span className="text-gray-600">Gender:</span> {selectedStudentProfile.gender}</p>
                      <p><span className="text-gray-600">Disability Status:</span> {selectedStudentProfile.disabilityStatus}</p>
                      {selectedStudentProfile.disabilityType && (
                        <p><span className="text-gray-600">Disability Type:</span> {selectedStudentProfile.disabilityType}</p>
                      )}
                      <p><span className="text-gray-600">ID Number:</span> {selectedStudentProfile.idNumber}</p>
                      <p><span className="text-gray-600">Birth Cert Number:</span> {selectedStudentProfile.birthCertNumber}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Parent/Guardian</h3>
                      <p><span className="text-gray-600">Name:</span> {selectedStudentProfile.parentName}</p>
                      <p><span className="text-gray-600">Phone:</span> {selectedStudentProfile.parentPhone}</p>
                      <p><span className="text-gray-600">Relationship:</span> {selectedStudentProfile.parentRelationship}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Location</h3>
                      <p><span className="text-gray-600">County:</span> {selectedStudentProfile.county}</p>
                      <p><span className="text-gray-600">Sub-County:</span> {selectedStudentProfile.subCounty}</p>
                      <p><span className="text-gray-600">Ward:</span> {selectedStudentProfile.ward}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Academic Background</h3>
                      <p><span className="text-gray-600">Previous School:</span> {selectedStudentProfile.previousSchool}</p>
                      <p><span className="text-gray-600">Highest Qualification:</span> {selectedStudentProfile.highestQualification}</p>
                    </div>
                    {selectedStudentProfile.documentUrls && selectedStudentProfile.documentUrls.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700">Documents</h3>
                        <ul className="list-disc list-inside">
                          {selectedStudentProfile.documentUrls.map((url, idx) => (
                            <li key={idx}>
                              <a
                                href={`http://localhost:8080/api/files/${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline text-sm"
                              >
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedStudentProfile(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstitutionLayout>
  );
}