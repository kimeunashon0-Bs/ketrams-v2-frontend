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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload, Download, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Staff {
  id: number;
  department: string;
  staffType: string;
  fullName: string;
  gender: string;
  designation: string;
  personnelFileNumber: string;
  jobGroup: string;
  idNumber: string;
  phoneNumber: string;
}

export default function InstitutionStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/institution/staff');
      // Backend returns array of arrays (rows from Google Sheets)
      // We'll transform into objects using row index as id
      const rows = res.data;
      const staff = rows.map((row: any[], idx: number) => ({
        id: idx,
        institution: row[0],
        department: row[1],
        staffType: row[2],
        fullName: row[3],
        gender: row[4],
        designation: row[5],
        personnelFileNumber: row[6],
        jobGroup: row[7],
        idNumber: row[8],
        phoneNumber: row[9],
      }));
      setStaffList(staff);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      if (editingStaff) {
        await api.put(`/institution/staff/${editingStaff.id}`, formData);
        toast.success('Staff updated');
      } else {
        await api.post('/institution/staff', formData);
        toast.success('Staff added');
      }
      setModalOpen(false);
      setEditingStaff(null);
      setFormData({});
      fetchStaff();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/institution/staff/${id}`);
        toast.success('Staff deleted');
        fetchStaff();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    for (const row of rows) {
      await api.post('/institution/staff', {
        department: row['Department'],
        staffType: row['Staff Type'],
        fullName: row['Full Name'],
        gender: row['Gender'],
        designation: row['Designation'],
        personnelFileNumber: row['PF Number'],
        jobGroup: row['Job Group'],
        idNumber: row['ID Number'],
        phoneNumber: row['Phone Number'],
      });
    }
    toast.success('Import completed');
    fetchStaff();
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/institution/staff/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.designation.toLowerCase().includes(search.toLowerCase())
  );

  const departments = [
    'ICT', 'Garment Making', 'Carpentry', 'Motor Vehicle', 'Agribusiness',
    'Food & Beverages', 'Electrical', 'Welding', 'Beauty', 'Plumbing', 'Masonry'
  ];

  const staffTypes = ['PERMANENT', 'BOM', 'SUPPORT'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingStaff(null); setFormData({}); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Staff
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Import Excel
          </Button>
          <input id="import-file" type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, department, or designation" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-4 text-center">No staff found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Staff Type</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.fullName}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.staffType}</TableCell>
                    <TableCell>{staff.designation}</TableCell>
                    <TableCell>{staff.phoneNumber}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingStaff(staff); setFormData(staff); setModalOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(staff.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
            <DialogDescription>Enter staff details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department *</Label>
              <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Staff Type *</Label>
              <Select value={formData.staffType} onValueChange={(v) => setFormData({...formData, staffType: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {staffTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input value={formData.fullName || ''} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <Label>Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Designation *</Label>
              <Input value={formData.designation || ''} onChange={(e) => setFormData({...formData, designation: e.target.value})} />
            </div>
            <div>
              <Label>PF Number (for Permanent)</Label>
              <Input value={formData.personnelFileNumber || ''} onChange={(e) => setFormData({...formData, personnelFileNumber: e.target.value})} />
            </div>
            <div>
              <Label>Job Group (for Permanent)</Label>
              <Input value={formData.jobGroup || ''} onChange={(e) => setFormData({...formData, jobGroup: e.target.value})} />
            </div>
            <div>
              <Label>ID Number (for BoM/Support)</Label>
              <Input value={formData.idNumber || ''} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input value={formData.phoneNumber || ''} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={processing}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}