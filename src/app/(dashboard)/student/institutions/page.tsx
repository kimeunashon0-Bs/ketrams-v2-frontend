"use client";
import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import api from '@/lib/api/axios';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Institution {
  id: number;
  name: string;
  category: string;
  subCounty: { name: string };
  ward: { name: string };
}

interface Course {
  id: number;
  name: string;
  level: string;
  category: string;
  documentUrls?: string[];
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCountyFilter, setSubCountyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Document viewing state
  const [selectedCourseForDocs, setSelectedCourseForDocs] = useState<Course | null>(null);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    let filtered = institutions;
    if (searchTerm) {
      filtered = filtered.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(inst => inst.category === categoryFilter);
    }
    if (subCountyFilter) {
      filtered = filtered.filter(inst => inst.subCounty.name === subCountyFilter);
    }
    setFilteredInstitutions(filtered);
  }, [searchTerm, categoryFilter, subCountyFilter, institutions]);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institution');
      setInstitutions(response.data);
      setFilteredInstitutions(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (institutionId: number) => {
    try {
      const response = await api.get(`/institution/${institutionId}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const handleViewCourses = (inst: Institution) => {
    setSelectedInstitution(inst);
    fetchCourses(inst.id);
  };

  // Get unique categories and sub-counties for filters
  const categories = [...new Set(institutions.map(inst => inst.category))];
  const subCounties = [...new Set(institutions.map(inst => inst.subCounty.name))];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Explore Institutions</h1>

        {/* Search and filters */}
        <div className="bg-white shadow rounded-lg p-4 space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={subCountyFilter}
              onChange={(e) => setSubCountyFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Sub-Counties</option>
              {subCounties.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Institutions list */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInstitutions.map((inst) => (
              <div key={inst.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{inst.name}</h3>
                  <p className="text-sm text-gray-500">{inst.category}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {inst.subCounty.name} - {inst.ward.name}
                  </p>
                  <button
                    onClick={() => handleViewCourses(inst)}
                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    View Courses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses modal */}
        {selectedInstitution && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedInstitution.name} - Courses
                </h2>
                <button
                  onClick={() => setSelectedInstitution(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4">
                {courses.length === 0 ? (
                  <p className="text-gray-500">No courses found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {courses.map((course) => (
                      <li key={course.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{course.name}</p>
                          <p className="text-xs text-gray-500">
                            {course.level} • {course.category}
                          </p>
                        </div>
                        {course.documentUrls && course.documentUrls.length > 0 && (
                          <button
                            onClick={() => setSelectedCourseForDocs(course)}
                            className="text-indigo-600 hover:text-indigo-900 text-xs"
                          >
                            Documents ({course.documentUrls.length})
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button
                  onClick={() => setSelectedInstitution(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document viewing modal */}
        {selectedCourseForDocs && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">Documents for {selectedCourseForDocs.name}</h3>
                <button
                  onClick={() => setSelectedCourseForDocs(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-4">
                <ul className="space-y-2">
                  {selectedCourseForDocs.documentUrls?.map((url, idx) => {
                    const filename = url.split('/').pop() || `doc-${idx}`;
                    return (
                      <li key={idx}>
                        <a
                          href={`http://localhost:8080/api/files/${encodeURIComponent(filename)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {filename}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button
                  onClick={() => setSelectedCourseForDocs(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}