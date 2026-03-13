"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Request {
  id: number;
  institutionName: string;
  category: string;
  adminFullName: string;
  adminPhone: string;
  adminEmail: string;
  adminGender: string;
  adminTitle: string;
  subCounty: { id: number; name: string };
  ward: { id: number; name: string };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  rejectionReason?: string;
}

export default function InstitutionRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState(''); // validation error
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(''); // API error
  const [credentials, setCredentials] = useState<{ phone: string; password: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/institution-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      setError('Failed to load requests. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    setError('');
    try {
      const response = await api.post('/admin/institution-requests/process', {
        requestId: selectedRequest.id,
        approved: true,
      });
      if (response.data.data) {
        setCredentials({
          phone: response.data.data.userPhone,
          password: response.data.data.tempPassword,
        });
      }
      await fetchRequests();
      closeActionModal();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Approval failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setRejectionError('Please provide a reason for rejection.');
      return;
    }
    if (!selectedRequest) return;
    setProcessing(true);
    setError('');
    try {
      await api.post('/admin/institution-requests/process', {
        requestId: selectedRequest.id,
        approved: false,
        rejectionReason,
      });
      await fetchRequests();
      closeActionModal();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Rejection failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const closeActionModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setRejectionReason('');
    setRejectionError('');
    setError('');
  };

  const viewDetails = (req: Request) => {
    setSelectedRequest(req);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Institution Registration Requests</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading requests...</div>
        </div>
      ) : error && requests.length === 0 ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No requests found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.institutionName}</div>
                    <div className="text-xs text-gray-500">{req.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{req.adminFullName}</div>
                    <div className="text-xs text-gray-500">{req.adminEmail} | {req.adminPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.subCounty.name} - {req.ward.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewDetails(req)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => { setSelectedRequest(req); setActionType('approve'); }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(req); setActionType('reject'); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Institution Information</h3>
                <p><span className="text-gray-600">Name:</span> {selectedRequest.institutionName}</p>
                <p><span className="text-gray-600">Category:</span> {selectedRequest.category || '—'}</p>
                <p><span className="text-gray-600">Sub-County:</span> {selectedRequest.subCounty.name}</p>
                <p><span className="text-gray-600">Ward:</span> {selectedRequest.ward.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Admin Information</h3>
                <p><span className="text-gray-600">Title:</span> {selectedRequest.adminTitle}</p>
                <p><span className="text-gray-600">Full Name:</span> {selectedRequest.adminFullName}</p>
                <p><span className="text-gray-600">Gender:</span> {selectedRequest.adminGender}</p>
                <p><span className="text-gray-600">Phone:</span> {selectedRequest.adminPhone}</p>
                <p><span className="text-gray-600">Email:</span> {selectedRequest.adminEmail}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Status</h3>
                <p><span className="text-gray-600">Current:</span> {selectedRequest.status}</p>
                {selectedRequest.rejectionReason && (
                  <p><span className="text-gray-600">Rejection Reason:</span> {selectedRequest.rejectionReason}</p>
                )}
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject) */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold capitalize">{actionType} Request</h2>
              <button
                onClick={closeActionModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p><span className="font-medium">Institution:</span> {selectedRequest.institutionName}</p>
              <p><span className="font-medium">Admin:</span> {selectedRequest.adminFullName}</p>
              {actionType === 'reject' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                    Reason for rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      if (rejectionError) setRejectionError('');
                    }}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please provide a reason..."
                  />
                  {rejectionError && (
                    <p className="mt-1 text-sm text-red-600">{rejectionError}</p>
                  )}
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeActionModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={processing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {credentials && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Institution Approved</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-gray-700">
                The institution has been created and an admin account has been set up.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Login Credentials</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Phone:</span> {credentials.phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Temporary Password:</span> {credentials.password}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Please share these credentials with the institution admin. They will be prompted to change password on first login.
              </p>
            </div>
            <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Phone: ${credentials.phone}\nPassword: ${credentials.password}`);
                  alert('Credentials copied to clipboard!');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setCredentials(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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