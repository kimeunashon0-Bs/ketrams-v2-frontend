"use client";
import { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import api from '@/lib/api/axios';
import { DocumentIcon, XMarkIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';

interface Course {
  id: number;
  name: string;
  level: string;
  category: string;
  enabled: boolean;
  documentUrls?: string[];
}

export default function InstitutionCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ name: '', level: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseStatus, setSelectedCourseStatus] = useState(false);

  // Document management state
  const [selectedCourseForDocs, setSelectedCourseForDocs] = useState<Course | null>(null);
  const [courseDocs, setCourseDocs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docPreviewUrls, setDocPreviewUrls] = useState<Map<File, string>>(new Map());

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/institution/courses');
      console.log('Fetched courses:', response.data);
      setCourses(response.data);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      setError(error.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', level: '', category: '' });
    setEditCourse(null);
    setShowAddModal(true);
  };

  const handleEdit = (course: Course) => {
    setFormData({ name: course.name, level: course.level, category: course.category || '' });
    setEditCourse(course);
    setShowAddModal(true);
  };

  const confirmToggle = (id: number, currentStatus: boolean) => {
    setSelectedCourseId(id);
    setSelectedCourseStatus(currentStatus);
    setShowConfirm(true);
  };

  const toggleCourse = async () => {
    if (!selectedCourseId) return;
    try {
      await api.patch(`/institution/courses/${selectedCourseId}/toggle`);
      fetchCourses();
      setShowConfirm(false);
      setSelectedCourseId(null);
    } catch (error) {
      console.error('Failed to toggle course', error);
      setError('Failed to update course status.');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editCourse) {
        await api.put(`/institution/courses/${editCourse.id}`, formData);
      } else {
        await api.post('/institution/courses', formData);
      }
      fetchCourses();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save course', error);
      setError('Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  // Document functions
  const handleManageDocs = (course: Course) => {
    setSelectedCourseForDocs(course);
    setCourseDocs(course.documentUrls || []);
    setDocFiles([]);
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setDocPreviewUrls(prev => new Map(prev).set(file, url));
        }
      });
    }
  };

  const removeDocFile = (file: File) => {
    setDocFiles(prev => prev.filter(f => f !== file));
    if (docPreviewUrls.has(file)) {
      URL.revokeObjectURL(docPreviewUrls.get(file)!);
      setDocPreviewUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(file);
        return newMap;
      });
    }
  };

  const uploadDocuments = async () => {
    if (!selectedCourseForDocs || docFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    docFiles.forEach(file => formData.append('files', file));
    try {
      await api.post(`/institution/courses/${selectedCourseForDocs.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCourses();
      setDocFiles([]);
      setDocPreviewUrls(new Map());
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (filename: string) => {
    if (!selectedCourseForDocs) return;
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/institution/courses/${selectedCourseForDocs.id}/documents?filename=${encodeURIComponent(filename)}`);
      fetchCourses();
      setCourseDocs(prev => prev.filter(f => f !== filename));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const openDocument = async (filename: string) => {
    try {
      const response = await api.get(`/files/${encodeURIComponent(filename)}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Failed to open document', error);
      alert('Could not open document. Please try again.');
    }
  };

  return (
    <InstitutionLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Add New Course
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No courses added yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleManageDocs(course)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Docs
                      </button>
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmToggle(course.id, course.enabled)}
                        className={`inline-flex items-center ${
                          course.enabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {course.enabled ? (
                          <>
                            <PauseIcon className="h-4 w-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Enable
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Certificate, Diploma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Engineering, Business"
                  />
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Management Modal */}
        {selectedCourseForDocs && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Documents for {selectedCourseForDocs.name}
                </h2>
                <button
                  onClick={() => setSelectedCourseForDocs(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Upload new */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload New Documents</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleDocFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {docFiles.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {docFiles.map((file, idx) => (
                        <div key={idx} className="relative border rounded p-1">
                          {file.type.startsWith('image/') ? (
                            <img src={docPreviewUrls.get(file)} alt={file.name} className="h-20 object-cover rounded" />
                          ) : (
                            <div className="h-20 flex items-center justify-center bg-gray-100">
                              <DocumentIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            onClick={() => removeDocFile(file)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                          <p className="text-xs truncate mt-1">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {docFiles.length > 0 && (
                    <button
                      onClick={uploadDocuments}
                      disabled={uploading}
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>

                {/* Existing documents */}
                {courseDocs.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Existing Documents</h3>
                    <ul className="divide-y divide-gray-200 border rounded-md">
                      {courseDocs.map((filename, idx) => (
                        <li key={idx} className="px-4 py-2 flex justify-between items-center">
                          <button
                            onClick={() => openDocument(filename)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm truncate text-left"
                          >
                            {filename}
                          </button>
                          <button
                            onClick={() => deleteDocument(filename)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Confirm Action</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-700">
                  Are you sure you want to {selectedCourseStatus ? 'disable' : 'enable'} this course?
                </p>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={toggleCourse}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstitutionLayout>
  );
}