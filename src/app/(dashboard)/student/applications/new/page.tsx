"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';

interface Institution {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
  level: string;
  category: string;
}

interface SelectedItem {
  institutionId: number;
  institutionName: string;
  courseId: number;
  courseName: string;
  courseLevel: string;
  key: string; // unique identifier for this selection
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Record<number, Course[]>>({}); // cache courses by institution
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [submissionResults, setSubmissionResults] = useState<Array<{ key: string; status: 'pending' | 'success' | 'error'; message?: string }>>([]);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institution');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
      setError('Failed to load institutions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (institutionId: number) => {
    if (courses[institutionId]) return; // already cached
    try {
      const response = await api.get(`/institution/${institutionId}/courses`);
      setCourses(prev => ({ ...prev, [institutionId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch courses', error);
      setError('Failed to load courses.');
    }
  };

  const handleInstitutionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const instId = e.target.value;
    setSelectedInstitution(instId);
    setSelectedCourses(new Set());
    if (instId) {
      await fetchCourses(parseInt(instId));
    }
  };

  const toggleCourse = (courseId: number) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const addSelectedToCart = () => {
    if (!selectedInstitution || selectedCourses.size === 0) return;
    const institution = institutions.find(i => i.id === parseInt(selectedInstitution));
    if (!institution) return;
    const instCourses = courses[parseInt(selectedInstitution)] || [];
    const newItems: SelectedItem[] = Array.from(selectedCourses).map(courseId => {
      const course = instCourses.find(c => c.id === courseId)!;
      return {
        institutionId: institution.id,
        institutionName: institution.name,
        courseId,
        courseName: course.name,
        courseLevel: course.level,
        key: `${institution.id}-${courseId}-${Date.now()}-${Math.random()}`,
      };
    });
    setSelectedItems(prev => [...prev, ...newItems]);
    setSelectedCourses(new Set());
    setSelectedInstitution('');
  };

  const removeItem = (key: string) => {
    setSelectedItems(prev => prev.filter(item => item.key !== key));
  };

  const clearAll = () => {
    setSelectedItems([]);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;
    setSubmitting(true);
    setError('');
    setSubmissionResults([]);
    setShowSummary(false);

    const results: Array<{ key: string; status: 'pending' | 'success' | 'error'; message?: string }> = selectedItems.map(item => ({
      key: item.key,
      status: 'pending',
    }));
    setSubmissionResults(results);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      try {
        await api.post('/student/applications', {
          institutionId: item.institutionId,
          courseId: item.courseId,
        });
        results[i] = { ...results[i], status: 'success' };
        setSubmissionResults([...results]);
      } catch (err: any) {
        results[i] = {
          ...results[i],
          status: 'error',
          message: err.response?.data?.message || 'Failed',
        };
        setSubmissionResults([...results]);
      }
    }

    setSubmitting(false);
    const allSuccess = results.every(r => r.status === 'success');
    if (allSuccess) {
      setTimeout(() => router.push('/student/applications'), 2000);
    }
  };

  return (
    
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">New Application</h1>

        {/* Selection area */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <select
                value={selectedInstitution}
                onChange={handleInstitutionChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">-- Choose an institution --</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addSelectedToCart}
                disabled={!selectedInstitution || selectedCourses.size === 0}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Add to List
              </button>
            </div>
          </div>

          {selectedInstitution && courses[parseInt(selectedInstitution)] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Courses for this Institution
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {courses[parseInt(selectedInstitution)].map((course) => (
                  <div key={course.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`course-${course.id}`}
                      checked={selectedCourses.has(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`course-${course.id}`} className="ml-3 block text-sm">
                      <span className="font-medium text-gray-900">{course.name}</span>
                      <span className="text-gray-500 ml-2">({course.level})</span>
                      <span className="text-gray-400 ml-2">{course.category}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected items summary */}
        {selectedItems.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Selected Applications ({selectedItems.length})</h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            <div className="border rounded-md divide-y">
              {selectedItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{item.courseName}</p>
                    <p className="text-sm text-gray-500">
                      {item.institutionName} • {item.courseLevel}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSummary(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Submission progress */}
        {submissionResults.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 space-y-2">
            <h3 className="font-medium text-gray-900">Submission Progress</h3>
            {submissionResults.map((result) => {
              const item = selectedItems.find(i => i.key === result.key);
              return (
                <div key={result.key} className="flex items-center text-sm">
                  <span className="flex-1">{item?.courseName || 'Course'}</span>
                  {result.status === 'pending' && (
                    <span className="text-yellow-600">Submitting...</span>
                  )}
                  {result.status === 'success' && (
                    <span className="text-green-600">✓ Submitted</span>
                  )}
                  {result.status === 'error' && (
                    <span className="text-red-600">✗ Failed: {result.message}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Review modal */}
        {showSummary && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Review Your Applications</h2>
                <button
                  onClick={() => setShowSummary(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4">
                <ul className="divide-y divide-gray-200">
                  {selectedItems.map((item) => (
                    <li key={item.key} className="py-3">
                      <p className="font-medium text-gray-900">{item.courseName}</p>
                      <p className="text-sm text-gray-500">{item.institutionName}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}