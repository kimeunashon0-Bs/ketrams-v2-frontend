"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { PencilIcon } from '@heroicons/react/24/outline';

interface ProfileData {
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

interface SubCounty {
  id: number;
  name: string;
}

interface Ward {
  id: number;
  name: string;
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [documents, setDocuments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<File, string>>(new Map());

  // Location data from DB
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedSubCountyId, setSelectedSubCountyId] = useState<number | null>(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  // Manual entry toggles
  const [manualSubCounty, setManualSubCounty] = useState(false);
  const [manualWard, setManualWard] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    gender: 'M',
    disabilityStatus: 'NORMAL',
    disabilityType: '',
    idNumber: '',
    birthCertNumber: '',
    parentName: '',
    parentPhone: '',
    parentRelationship: '',
    county: 'Kakamega',
    subCounty: '',
    ward: '',
    previousSchool: '',
    highestQualification: '',
    documentUrls: [],
  });

  // Fetch sub-counties on mount
  useEffect(() => {
    fetchSubCounties();
  }, []);

  // When sub-county name changes (from profile load), find its ID and fetch wards
  useEffect(() => {
    if (subCounties.length > 0 && formData.subCounty && !selectedSubCountyId) {
      const matched = subCounties.find(sc => sc.name === formData.subCounty);
      if (matched) {
        setSelectedSubCountyId(matched.id);
        setManualSubCounty(false);
        fetchWards(matched.id);
      } else {
        // Current subCounty not in list – enable manual entry
        setManualSubCounty(true);
        setSelectedSubCountyId(null);
        setWards([]);
      }
    }
  }, [subCounties, formData.subCounty]);

  // When selectedSubCountyId changes (dropdown selection), fetch wards
  useEffect(() => {
    if (selectedSubCountyId) {
      fetchWards(selectedSubCountyId);
    }
  }, [selectedSubCountyId]);

  const fetchSubCounties = async () => {
    try {
      const response = await api.get('/subcounties'); // matches SecurityConfig
      setSubCounties(response.data); // adjust if wrapped
    } catch (error) {
      console.error('Failed to fetch sub-counties', error);
    }
  };

  const fetchWards = async (subCountyId: number) => {
    setLoadingLocations(true);
    try {
      // Using query parameter subCountyId – adjust if backend expects different name
      const response = await api.get(`/wards?subCountyId=${subCountyId}`);
      setWards(response.data);
    } catch (error) {
      console.error('Failed to fetch wards', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/profile');
      if (response.data.data) {
        const profile = response.data.data;
        const safeProfile: ProfileData = {
          fullName: profile.fullName ?? '',
          gender: profile.gender ?? 'M',
          disabilityStatus: profile.disabilityStatus ?? 'NORMAL',
          disabilityType: profile.disabilityType ?? '',
          idNumber: profile.idNumber ?? '',
          birthCertNumber: profile.birthCertNumber ?? '',
          parentName: profile.parentName ?? '',
          parentPhone: profile.parentPhone ?? '',
          parentRelationship: profile.parentRelationship ?? '',
          county: profile.county ?? 'Kakamega',
          subCounty: profile.subCounty ?? '',
          ward: profile.ward ?? '',
          previousSchool: profile.previousSchool ?? '',
          highestQualification: profile.highestQualification ?? '',
          documentUrls: profile.documentUrls ?? [],
        };
        setFormData(safeProfile);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsEditing(true);
      } else {
        console.error('Failed to fetch profile', error);
        setError('Failed to load profile data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const calculateCompletion = () => {
    const requiredFields = ['fullName', 'gender', 'disabilityStatus', 'county', 'subCounty', 'ward', 'previousSchool', 'highestQualification'];
    let filled = 0;
    requiredFields.forEach(field => {
      if (formData[field as keyof ProfileData] && formData[field as keyof ProfileData] !== '') filled++;
    });
    return Math.round((filled / requiredFields.length) * 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Sub-county selection from dropdown
  const handleSubCountySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subCountyId = parseInt(e.target.value);
    const selected = subCounties.find(sc => sc.id === subCountyId);
    if (selected) {
      setSelectedSubCountyId(subCountyId);
      setFormData(prev => ({ ...prev, subCounty: selected.name, ward: '' }));
      setManualSubCounty(false);
    }
  };

  // Manual sub-county input
  const handleSubCountyManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, subCounty: e.target.value, ward: '' }));
    setSelectedSubCountyId(null);
    setWards([]);
  };

  // Ward selection from dropdown
  const handleWardSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = parseInt(e.target.value);
    const selected = wards.find(w => w.id === wardId);
    if (selected) {
      setFormData(prev => ({ ...prev, ward: selected.name }));
      setManualWard(false);
    }
  };

  // Manual ward input
  const handleWardManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, ward: e.target.value }));
  };

  const toggleManualSubCounty = () => {
    setManualSubCounty(!manualSubCounty);
    if (!manualSubCounty) {
      // Switching to manual: clear selected ID and wards
      setSelectedSubCountyId(null);
      setWards([]);
    } else {
      // Switching back to dropdown: if current subCounty matches an existing one, select it
      const matched = subCounties.find(sc => sc.name === formData.subCounty);
      if (matched) {
        setSelectedSubCountyId(matched.id);
        fetchWards(matched.id);
      }
    }
  };

  const toggleManualWard = () => {
    setManualWard(!manualWard);
    if (!manualWard && selectedSubCountyId) {
      // Switching back to dropdown: if current ward matches an existing one
      // No need to fetch again as wards are already loaded
    }
  };

  const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const oversized = files.some(f => !validateFileSize(f, 10));
      if (oversized) {
        setError('One or more files exceed 10MB. Please choose smaller files.');
        e.target.value = '';
        return;
      }
      setError('');
      setDocuments(prev => [...prev, ...files]);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrls(prev => new Map(prev).set(file, url));
        }
      });
    }
  };

  const removeFile = (file: File) => {
    setDocuments(prev => prev.filter(f => f !== file));
    if (previewUrls.has(file)) {
      URL.revokeObjectURL(previewUrls.get(file)!);
      setPreviewUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(file);
        return newMap;
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && !Array.isArray(value)) {
        submitData.append(key, String(value));
      }
    });
    documents.forEach(file => submitData.append('documents', file));

    try {
      await api.post('/student/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile saved successfully!');
      await fetchProfile();
      setDocuments([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls(new Map());
    } catch (err: any) {
      console.error('Profile save error:', err);
      if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = formData.fullName ? formData.fullName.split(' ')[0] : '';

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">
          {getGreeting()}{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="mt-2 text-indigo-100">
          Manage your profile and keep your information up to date.
        </p>
      </div>

      {/* Profile Completion Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-medium text-indigo-600">{calculateCompletion()}%</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${calculateCompletion()}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {error && (
          <div className="bg-red-50 bord      er-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Edit Button */}
        {!isEditing && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                disabled={!isEditing}
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                required
                disabled={!isEditing}
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Disability Status</label>
              <select
                name="disabilityStatus"
                required
                disabled={!isEditing}
                value={formData.disabilityStatus}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="NORMAL">Normal</option>
                <option value="PWD">PWD</option>
              </select>
            </div>
            {formData.disabilityStatus === 'PWD' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Disability Type</label>
                <input
                  type="text"
                  name="disabilityType"
                  disabled={!isEditing}
                  value={formData.disabilityType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <input
                type="text"
                name="idNumber"
                disabled={!isEditing}
                value={formData.idNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Certificate Number</label>
              <input
                type="text"
                name="birthCertNumber"
                disabled={!isEditing}
                value={formData.birthCertNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-medium text-gray-900">Parent/Guardian Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Name</label>
              <input
                type="text"
                name="parentName"
                disabled={!isEditing}
                value={formData.parentName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
              <input
                type="text"
                name="parentPhone"
                disabled={!isEditing}
                value={formData.parentPhone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                name="parentRelationship"
                disabled={!isEditing}
                value={formData.parentRelationship}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-medium text-gray-900">Location Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">County</label>
              <input
                type="text"
                name="county"
                disabled={!isEditing}
                value={formData.county}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Sub-County field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Sub-County</label>
              {!manualSubCounty ? (
                <div className="flex items-center gap-2">
                  <select
                    disabled={!isEditing || subCounties.length === 0}
                    value={selectedSubCountyId || ''}
                    onChange={handleSubCountySelect}
                    className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Sub-County</option>
                    {subCounties.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={toggleManualSubCounty}
                      className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                    >
                      Enter manually
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="subCounty"
                    disabled={!isEditing}
                    value={formData.subCounty}
                    onChange={handleSubCountyManual}
                    className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={toggleManualSubCounty}
                      className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                    >
                      Select from list
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Ward field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Ward</label>
              {!manualWard ? (
                <div className="flex items-center gap-2">
                  <select
                    disabled={!isEditing || !selectedSubCountyId || loadingLocations}
                    value={wards.find(w => w.name === formData.ward)?.id || ''}
                    onChange={handleWardSelect}
                    className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  {isEditing && selectedSubCountyId && (
                    <button
                      type="button"
                      onClick={toggleManualWard}
                      className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                    >
                      Enter manually
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="ward"
                    disabled={!isEditing}
                    value={formData.ward}
                    onChange={handleWardManual}
                    className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {isEditing && selectedSubCountyId && (
                    <button
                      type="button"
                      onClick={toggleManualWard}
                      className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                    >
                      Select from list
                    </button>
                  )}
                </div>
              )}
              {loadingLocations && <p className="text-xs text-gray-500 mt-1">Loading wards...</p>}
            </div>
          </div>
        </div>

        {/* Academic Background */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-medium text-gray-900">Academic Background</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Previous School</label>
              <input
                type="text"
                name="previousSchool"
                disabled={!isEditing}
                value={formData.previousSchool}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Highest Qualification</label>
              <input
                type="text"
                name="highestQualification"
                disabled={!isEditing}
                value={formData.highestQualification}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
 
        {/* Document Upload */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-medium text-gray-900">Supporting Documents (max 10MB each, multiple allowed)</h2>
          <div>
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
              disabled={!isEditing}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {formData.documentUrls && formData.documentUrls.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Existing documents:</p>
                <ul className="list-disc list-inside">
                  {formData.documentUrls.map((filename, idx) => (
                    <li key={idx} className="text-xs text-gray-600">
                      <button
                        type="button"
                        onClick={() => openDocument(filename)}
                        className="text-indigo-600 hover:underline text-left"
                      >
                        {filename}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {documents.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {documents.map((file, idx) => (
                  <div key={idx} className="relative group border rounded p-1">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={previewUrls.get(file) || ''}
                        alt={file.name}
                        className="h-20 w-full object-cover rounded"
                      />
                    ) : (
                      <div className="h-20 w-full flex items-center justify-center bg-gray-100 rounded">
                        <span className="text-xs text-gray-500">PDF</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                    <p className="text-xs truncate mt-1">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        {isEditing && (
          <div className="flex justify-end space-x-3">
            {formData.documentUrls && formData.documentUrls.length > 0 && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}