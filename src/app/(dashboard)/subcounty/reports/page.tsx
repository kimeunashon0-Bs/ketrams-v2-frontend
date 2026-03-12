"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { saveAs } from 'file-saver';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

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
    name: string;
  };
  course: {
    name: string;
  };
  status: string;
  appliedAt: string;
}

interface ReportData {
  totalApplications: number;
  byStatus: Record<string, number>;
  byGender: Record<string, number>;
  byDisability: Record<string, number>;
  byWard: Record<string, number>;
  byInstitution: Record<string, number>;
  byCourse: Record<string, number>;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6b7280', '#84cc16'
];

export default function SubCountyReportsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [summary, setSummary] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    institution: '',
    ward: '',
    student: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, applications]);

  const fetchData = async () => {
    try {
      const [appsRes, summaryRes] = await Promise.all([
        api.get('/subcounty/applications'),
        api.get('/subcounty/reports/summary')
      ]);
      setApplications(appsRes.data.data);
      setFilteredApps(appsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = applications;
    if (filters.institution) {
      filtered = filtered.filter(app =>
        app.institution.name.toLowerCase().includes(filters.institution.toLowerCase())
      );
    }
    if (filters.ward) {
      filtered = filtered.filter(app =>
        app.student.ward.toLowerCase().includes(filters.ward.toLowerCase())
      );
    }
    if (filters.student) {
      filtered = filtered.filter(app =>
        app.student.fullName.toLowerCase().includes(filters.student.toLowerCase())
      );
    }
    setFilteredApps(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const downloadAsCsv = () => {
    if (!filteredApps.length) return;
    const csvContent = [];
    csvContent.push('ID,Student Name,Gender,PWD,Ward,Institution,Course,Status,Applied Date');
    filteredApps.forEach(app => {
      csvContent.push(
        `${app.id},${app.student.fullName},${app.student.gender},${app.student.disabilityStatus},${app.student.ward},${app.institution.name},${app.course.name},${app.status},${app.appliedAt}`
      );
    });
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'subcounty-applications.csv');
  };

  // Compute aggregated data from filtered applications
  const getFilteredSummary = (): ReportData => {
    const byStatus: Record<string, number> = {};
    const byGender: Record<string, number> = {};
    const byDisability: Record<string, number> = {};
    const byWard: Record<string, number> = {};
    const byInstitution: Record<string, number> = {};
    const byCourse: Record<string, number> = {};

    filteredApps.forEach(app => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      byGender[app.student.gender] = (byGender[app.student.gender] || 0) + 1;
      byDisability[app.student.disabilityStatus] = (byDisability[app.student.disabilityStatus] || 0) + 1;
      byWard[app.student.ward] = (byWard[app.student.ward] || 0) + 1;
      byInstitution[app.institution.name] = (byInstitution[app.institution.name] || 0) + 1;
      byCourse[app.course.name] = (byCourse[app.course.name] || 0) + 1;
    });

    return {
      totalApplications: filteredApps.length,
      byStatus,
      byGender,
      byDisability,
      byWard,
      byInstitution,
      byCourse,
    };
  };

  const filteredSummary = getFilteredSummary();

  // Prepare chart data
  const statusData = Object.entries(filteredSummary.byStatus).map(([name, value]) => ({ name, value }));
  const genderData = Object.entries(filteredSummary.byGender).map(([name, value]) => ({ name, value }));
  const disabilityData = Object.entries(filteredSummary.byDisability).map(([name, value]) => ({ name, value }));
  const wardData = Object.entries(filteredSummary.byWard).map(([name, value]) => ({ name, value }));
  const institutionData = Object.entries(filteredSummary.byInstitution).map(([name, value]) => ({ name, value }));
  const courseData = Object.entries(filteredSummary.byCourse).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sub‑County Reports</h1>
          <button
            onClick={downloadAsCsv}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
            Download CSV
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="institution"
              placeholder="Filter by institution..."
              value={filters.institution}
              onChange={handleFilterChange}
              className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="ward"
              placeholder="Filter by ward..."
              value={filters.ward}
              onChange={handleFilterChange}
              className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="student"
              placeholder="Filter by student name..."
              value={filters.student}
              onChange={handleFilterChange}
              className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{filteredSummary.totalApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Unique Wards</p>
            <p className="text-3xl font-bold text-gray-900">{wardData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">PWD Applicants</p>
            <p className="text-3xl font-bold text-gray-900">{filteredSummary.byDisability?.PWD || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Facilitated</p>
            <p className="text-3xl font-bold text-gray-900">{filteredSummary.byStatus?.FACILITATED || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status pie chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} applications`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gender pie chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Gender</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Disability bar chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Disability Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={disabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ward bar chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Ward</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Institution bar chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Institution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={institutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course bar chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Course</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Preview table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Applications Preview</h2>
            <p className="text-sm text-gray-500">Showing {filteredApps.length} applications</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApps.slice(0, 10).map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.student.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.institution.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.course.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'FACILITATED' ? 'bg-green-100 text-green-800' :
                        app.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'PENDING_CLARIFICATION' ? 'bg-red-100 text-red-800' :
                        app.status === 'WAITLISTED' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(app.appliedAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length > 10 && (
              <div className="px-6 py-3 text-sm text-gray-500 text-center border-t">
                Showing first 10 of {filteredApps.length} applications
              </div>
            )}
          </div>
        </div>
      </div>
  );
}