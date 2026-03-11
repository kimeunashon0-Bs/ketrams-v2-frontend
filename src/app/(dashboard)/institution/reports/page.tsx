"use client";
import { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import api from '@/lib/api/axios';
import { saveAs } from 'file-saver';

interface ReportSummary {
  byStatus: [string, number][];
  byCourse: [string, number][];
  bySubCounty: [string, number][];
}

export default function InstitutionReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    courseId: '',
    status: '',
    subCounty: '',
  });
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchSummary();
    fetchCourses();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institution/reports/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report summary', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/institution/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.status) params.append('status', filters.status);
      if (filters.subCounty) params.append('subCounty', filters.subCounty);
      
      const response = await api.get(`/institution/reports/export/csv?${params.toString()}`, {
        responseType: 'blob',
      });
      saveAs(new Blob([response.data]), 'applications-report.csv');
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <InstitutionLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

        {/* Filter section */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Filter Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING_INSTITUTION">Pending</option>
              <option value="APPROVED_BY_INSTITUTION">Approved</option>
              <option value="REJECTED_BY_INSTITUTION">Rejected</option>
            </select>
            <input
              type="text"
              placeholder="Sub-County"
              value={filters.subCounty}
              onChange={(e) => setFilters({ ...filters, subCounty: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleExport}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Export to CSV
          </button>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div>Loading...</div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">By Status</h3>
              <ul className="space-y-1">
                {summary.byStatus.map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="text-gray-600">{status.replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">By Course</h3>
              <ul className="space-y-1">
                {summary.byCourse.map(([course, count]) => (
                  <li key={course} className="flex justify-between">
                    <span className="text-gray-600">{course}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">By Sub-County</h3>
              <ul className="space-y-1">
                {summary.bySubCounty.map(([subCounty, count]) => (
                  <li key={subCounty} className="flex justify-between">
                    <span className="text-gray-600">{subCounty}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </InstitutionLayout>
  );
}