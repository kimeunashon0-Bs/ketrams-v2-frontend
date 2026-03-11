"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { PencilIcon, PauseIcon, PlayIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Institution {
  id: number;
  name: string;
  category: string;
  subCounty: { id: number; name: string };
  ward: { id: number; name: string };
  enabled: boolean;
}

interface SubCounty {
  id: number;
  name: string;
}

interface Ward {
  id: number;
  name: string;
}

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  const [selectedInstitutionStatus, setSelectedInstitutionStatus] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCountyId: '',
    wardId: '',
  });

  useEffect(() => {
    fetchInstitutions();
    fetchSubCounties();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/admin/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCounties = async () => {
    try {
      const response = await api.get('/subcounties');
      setSubCounties(response.data);
    } catch (error) {
      console.error('Failed to fetch sub-counties', error);
    }
  };

  const fetchWards = async (subCountyId: number) => {
    try {
      const response = await api.get(`/wards?subCountyId=${subCountyId}`);
      setWards(response.data);
    } catch (error) {
      console.error('Failed to fetch wards', error);
    }
  };

  const handleSubCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFormData({ ...formData, subCountyId: id, wardId: '' });
    if (id) fetchWards(parseInt(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/institutions/${editingId}`, formData);
      } else {
        await api.post('/admin/institutions', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', category: '', subCountyId: '', wardId: '' });
      fetchInstitutions();
    } catch (error) {
      console.error('Failed to save institution', error);
    }
  };

  const handleEdit = (inst: Institution) => {
    setEditingId(inst.id);
    setFormData({
      name: inst.name,
      category: inst.category || '',
      subCountyId: inst.subCounty.id.toString(),
      wardId: inst.ward.id.toString(),
    });
    fetchWards(inst.subCounty.id);
    setShowModal(true);
  };

  const confirmToggle = (id: number, currentStatus: boolean) => {
    setSelectedInstitutionId(id);
    setSelectedInstitutionStatus(currentStatus);
    setShowConfirm(true);
  };

  const toggleInstitution = async () => {
    if (!selectedInstitutionId) return;
    try {
      await api.patch(`/admin/institutions/${selectedInstitutionId}/toggle`);
      fetchInstitutions();
      setShowConfirm(false);
      setSelectedInstitutionId(null);
    } catch (error) {
      console.error('Failed to toggle institution status', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" /> Add Institution
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-County</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {institutions.map((inst) => (
                <tr key={inst.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inst.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.subCounty.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.ward.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inst.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inst.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(inst)} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => confirmToggle(inst.id, inst.enabled)}
                      className={`inline-flex items-center ${
                        inst.enabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {inst.enabled ? (
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
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Institution' : 'Add Institution'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sub-County</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700">Ward</label>
                <select
                  required
                  value={formData.wardId}
                  onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                  disabled={!formData.subCountyId}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
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
                Are you sure you want to {selectedInstitutionStatus ? 'disable' : 'enable'} this institution?
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
                onClick={toggleInstitution}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}