"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/axios';
import PublicLayout from '@/components/layout/PublicLayout';

interface SubCounty {
  id: number;
  name: string;
}
interface Ward {
  id: number;
  name: string;
}

export default function ApplyInstitutionPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    institutionName: '',
    category: '',
    adminFullName: '',
    adminPhone: '',
    adminEmail: '',
    adminGender: 'M',
    adminTitle: 'Mr',
    subCountyId: '',
    wardId: '',
  });

  useEffect(() => {
    fetchSubCounties();
  }, []);

  const fetchSubCounties = async () => {
    try {
      const res = await api.get('/subcounties');
      setSubCounties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWards = async (subCountyId: number) => {
    try {
      const res = await api.get(`/wards?subCountyId=${subCountyId}`);
      setWards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFormData({ ...formData, subCountyId: id, wardId: '' });
    if (id) fetchWards(parseInt(id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.institutionName || !formData.subCountyId || !formData.wardId) {
        setError('Please fill all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.adminFullName || !formData.adminPhone || !formData.adminEmail) {
        setError('Please fill all required fields');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/public/institution-requests', formData);
      console.log('Submission response:', response.data); // DEBUG
      setSuccess('Request submitted successfully. You will receive an email once approved.');
      // Reset form
      setFormData({
        institutionName: '',
        category: '',
        adminFullName: '',
        adminPhone: '',
        adminEmail: '',
        adminGender: 'M',
        adminTitle: 'Mr',
        subCountyId: '',
        wardId: '',
      });
      setStep(1);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Register Your Institution"
      subtitle="Fill in the details to apply for an institution admin account."
    >
      <div className="mt-8 space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? 'bg-indigo-600 text-white'
                    : s < step
                    ? 'bg-indigo-200 text-indigo-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 mx-1 ${s < step ? 'bg-indigo-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-slideInRight">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution Name *</label>
              <input
                type="text"
                name="institutionName"
                required
                value={formData.institutionName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category (e.g., Public TVET)</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-County *</label>
              <select
                name="subCountyId"
                required
                value={formData.subCountyId}
                onChange={handleSubCountyChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select</option>
                {subCounties.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ward *</label>
              <select
                name="wardId"
                required
                value={formData.wardId}
                onChange={handleChange}
                disabled={!formData.subCountyId}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slideInRight">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <select
                  name="adminTitle"
                  value={formData.adminTitle}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  name="adminGender"
                  value={formData.adminGender}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="adminFullName"
                required
                value={formData.adminFullName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                name="adminPhone"
                required
                value={formData.adminPhone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0712345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="adminEmail"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="admin@institution.ac.ke"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-slideInRight">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Review your information</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="inline font-medium">Institution:</dt> <dd className="inline ml-2 text-gray-700">{formData.institutionName}</dd></div>
                <div><dt className="inline font-medium">Category:</dt> <dd className="inline ml-2 text-gray-700">{formData.category || '—'}</dd></div>
                <div><dt className="inline font-medium">Location:</dt> <dd className="inline ml-2 text-gray-700">
                  {subCounties.find(sc => sc.id === Number(formData.subCountyId))?.name} – {wards.find(w => w.id === Number(formData.wardId))?.name}
                </dd></div>
                <div><dt className="inline font-medium">Admin:</dt> <dd className="inline ml-2 text-gray-700">{formData.adminTitle} {formData.adminFullName}</dd></div>
                <div><dt className="inline font-medium">Gender:</dt> <dd className="inline ml-2 text-gray-700">{formData.adminGender}</dd></div>
                <div><dt className="inline font-medium">Phone:</dt> <dd className="inline ml-2 text-gray-700">{formData.adminPhone}</dd></div>
                <div><dt className="inline font-medium">Email:</dt> <dd className="inline ml-2 text-gray-700">{formData.adminEmail}</dd></div>
              </dl>
            </div>
          </div>
        )}

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">{success}</div>}

        <div className="flex justify-between space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
        </div>

        <div className="text-sm text-center">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to home
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}