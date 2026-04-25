"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Pencil, Plus, Power, PowerOff } from 'lucide-react';

interface Institution {
  id: number;
  name: string;
  category: string;
  subCounty: {
    id: number;
    name: string;
    constituency: string;
  };
  ward: {
    id: number;
    name: string;
  };
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

export default function MinistryInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCountyId: '',
    wardId: '',
  });
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInstitutions();
    fetchSubCounties();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ministry/institutions');
      setInstitutions(response.data);
    } catch (err) {
      console.error('Failed to fetch institutions', err);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCounties = async () => {
    try {
      const res = await api.get('/subcounties');
      setSubCounties(res.data);
    } catch (err) {
      console.error('Failed to fetch sub-counties', err);
    }
  };

  const fetchWards = async (subCountyId: number) => {
    if (!subCountyId) return;
    try {
      const res = await api.get(`/wards?subCountyId=${subCountyId}`);
      setWards(res.data);
    } catch (err) {
      console.error('Failed to fetch wards', err);
    }
  };

  const handleSubCountyChange = (subCountyId: string) => {
    setFormData({ ...formData, subCountyId, wardId: '' });
    if (subCountyId) fetchWards(parseInt(subCountyId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (editingId) {
        await api.put(`/ministry/institutions/${editingId}`, formData);
        toast.success('Institution updated');
      } else {
        await api.post('/ministry/institutions', formData);
        toast.success('Institution created');
      }
      setModalOpen(false);
      resetForm();
      fetchInstitutions();
    } catch (err) {
      console.error('Failed to save institution', err);
      toast.error('Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/ministry/institutions/${id}/toggle`);
      toast.success(`Institution ${currentStatus ? 'disabled' : 'enabled'}`);
      fetchInstitutions();
    } catch (err) {
      console.error('Failed to toggle institution', err);
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (inst: Institution) => {
    setEditingId(inst.id);
    setFormData({
      name: inst.name,
      category: inst.category || '',
      subCountyId: inst.subCounty?.id?.toString() || '',
      wardId: inst.ward?.id?.toString() || '',
    });
    if (inst.subCounty?.id) fetchWards(inst.subCounty.id);
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', subCountyId: '', wardId: '' });
    setWards([]);
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.subCounty?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Institutions</h1>
        <Button onClick={() => { resetForm(); setModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Institution
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or sub-county..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="p-4 text-center">No institutions found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sub-County</TableHead>
                  <TableHead>Constituency</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstitutions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">{inst.name}</TableCell>
                    <TableCell>{inst.category || '—'}</TableCell>
                    <TableCell>{inst.subCounty?.name || '—'}</TableCell>
                    <TableCell>{inst.subCounty?.constituency || '—'}</TableCell>
                    <TableCell>{inst.ward?.name || '—'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${inst.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {inst.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(inst)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(inst.id, inst.enabled)}
                      >
                        {inst.enabled ? (
                          <PowerOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Institution' : 'Add Institution'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the institution details.' : 'Fill in the details to create a new institution.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Sub-County *</Label>
              <Select
                value={formData.subCountyId}
                onValueChange={handleSubCountyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-county" />
                </SelectTrigger>
                <SelectContent>
                  {subCounties.map(sc => (
                    <SelectItem key={sc.id} value={sc.id.toString()}>{sc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ward *</Label>
              <Select
                value={formData.wardId}
                onValueChange={(v) => setFormData({ ...formData, wardId: v })}
                disabled={!formData.subCountyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map(w => (
                    <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={processing}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}