"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { format } from 'date-fns';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';

interface Application {
  id: number;
  student: {
    fullName: string;
    gender: string;
    disabilityStatus: string;
    subCounty: string;
    ward: string;
  };
  institution: {
    id: number;
    name: string;
  };
  course: {
    id: number;
    name: string;
    level: string;
  };
  status: string;
  appliedAt: string;
  institutionRemarks: string | null;
  subCountyRemarks: string | null;
  facilitationAmount: number | null;
}

interface FilterOptions {
  ward: string;
  gender: string;
  disabilityStatus: string;
  courseId: string;
  institutionId: string;
  status: string;
}

export default function SubCountyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    ward: '',
    gender: '',
    disabilityStatus: '',
    courseId: '',
    institutionId: '',
    status: '',
  });
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [institutions, setInstitutions] = useState<{ id: number; name: string }[]>([]);
  const [selectedApps, setSelectedApps] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [actionType, setActionType] = useState<'verify' | 'facilitate' | 'flag' | 'waitlist' | 'batch-facilitate' | null>(null);

  useEffect(() => {
    fetchApplications();
    fetchCoursesAndInstitutions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  useEffect(() => {
    if (selectAll) {
      setSelectedApps(new Set(filteredApps.map(a => a.id)));
    } else {
      setSelectedApps(new Set());
    }
  }, [selectAll, filteredApps]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subcounty/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndInstitutions = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        api.get('/courses'),
        api.get('/institutions')
      ]);
      setCourses(coursesRes.data);
      setInstitutions(instRes.data);
    } catch (error) {
      console.error('Failed to fetch courses/institutions', error);
    }
  };

  const applyFilters = () => {
    let filtered = applications;
    if (filters.ward) filtered = filtered.filter(a => a.student.ward === filters.ward);
    if (filters.gender) filtered = filtered.filter(a => a.student.gender === filters.gender);
    if (filters.disabilityStatus) filtered = filtered.filter(a => a.student.disabilityStatus === filters.disabilityStatus);
    if (filters.courseId) filtered = filtered.filter(a => a.course.id === parseInt(filters.courseId));
    if (filters.institutionId) filtered = filtered.filter(a => a.institution.id === parseInt(filters.institutionId));
    if (filters.status) filtered = filtered.filter(a => a.status === filters.status);
    setFilteredApps(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApps(newSelected);
    if (newSelected.size === filteredApps.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const handleSingleAction = async () => {
    if (!selectedApp || !actionType) return;
    setActionLoading(true);
    try {
      let url = `/subcounty/applications/${selectedApp.id}/${actionType}`;
      const params = new URLSearchParams();
      if (remarks) params.append('remarks', remarks);
      if (actionType === 'facilitate') params.append('amount', amount.toString());
      if (params.toString()) url += `?${params.toString()}`;
      await api.post(url);
      await fetchApplications();
      setSelectedApp(null);
      setRemarks('');
      setAmount(0);
      setActionType(null);
    } catch (error) {
      console.error(`Failed to ${actionType}`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchFacilitate = async () => {
    if (selectedApps.size === 0) return;
    setActionLoading(true);
    try {
      await api.post('/subcounty/applications/batch/facilitate', {
        applicationIds: Array.from(selectedApps),
        amount,
        remarks,
      });
      await fetchApplications();
      setSelectedApps(new Set());
      setAmount(0);
      setRemarks('');
      setActionType(null);
    } catch (error) {
      console.error('Batch facilitate failed', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.ward) params.append('ward', filters.ward);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.disabilityStatus) params.append('disabilityStatus', filters.disabilityStatus);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/subcounty/applications/export/csv?${params.toString()}`, {
        responseType: 'blob',
      });
      saveAs(new Blob([response.data]), 'subcounty-applications.csv');
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Applications in Your Sub‑County</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select name="ward" value={filters.ward} onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option value="">All Wards</option>
            {[...new Set(applications.map(a => a.student.ward))].map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
          <select name="gender" value={filters.gender} onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option value="">All Genders</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <select name="disabilityStatus" value={filters.disabilityStatus} onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option value="">All</option>
            <option value="NORMAL">Normal</option>
            <option value="PWD">PWD</option>
          </select>
          <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="institutionId" value={filters.institutionId} onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option value="">All Institutions</option>
            {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option value="">All Statuses</option>
            <option value="APPROVED_BY_INSTITUTION">Pending Sub‑County</option>
            <option value="VERIFIED">Verified</option>
            <option value="FACILITATED">Facilitated</option>
            <option value="NOT_FACILITATED">Not Facilitated</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="PENDING_CLARIFICATION">Flagged</option>
          </select>
        </div>

        {/* Batch action bar */}
        {selectedApps.size > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
            <span className="text-indigo-700">{selectedApps.size} applications selected</span>
            <button
              onClick={() => setActionType('batch-facilitate')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Batch Facilitate
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No applications found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => setSelectAll(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedApps.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.student.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {app.student.gender} • {app.student.ward} • {app.student.disabilityStatus === 'PWD' ? 'PWD' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.course.name}</div>
                      <div className="text-xs text-gray-500">{app.institution.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'APPROVED_BY_INSTITUTION' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        app.status === 'FACILITATED' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'NOT_FACILITATED' ? 'bg-gray-100 text-gray-800' :
                        app.status === 'WAITLISTED' ? 'bg-orange-100 text-orange-800' :
                        app.status === 'PENDING_CLARIFICATION' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => { setSelectedApp(app); setActionType('verify'); }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => { setSelectedApp(app); setActionType('facilitate'); }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Facilitate
                      </button>
                      <button
                        onClick={() => { setSelectedApp(app); setActionType('flag'); }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Flag
                      </button>
                      <button
                        onClick={() => { setSelectedApp(app); setActionType('waitlist'); }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Waitlist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Single Action Modal */}
        {selectedApp && actionType && actionType !== 'batch-facilitate' && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold capitalize">{actionType} Application</h2>
                <button onClick={() => { setSelectedApp(null); setActionType(null); }} className="text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <p><span className="font-medium">Student:</span> {selectedApp.student.fullName}</p>
                <p><span className="font-medium">Course:</span> {selectedApp.course.name}</p>
                {actionType === 'facilitate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => { setSelectedApp(null); setActionType(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSingleAction}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Facilitate Modal */}
        {actionType === 'batch-facilitate' && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Batch Facilitate ({selectedApps.size} applications)</h2>
                <button onClick={() => { setActionType(null); }} className="text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount per application (KES)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchFacilitate}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}