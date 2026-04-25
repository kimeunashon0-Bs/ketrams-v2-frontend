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

interface Asset {
  id: number;
  department: string;
  assetType: string;
  itemDescription: string;
  dateAcquired: string;
  value: number;
  serialNumber: string;
  remarks: string;
}

export default function InstitutionAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

const fetchAssets = async () => {
  setLoading(true);
  try {
    const res = await api.get('/institution/assets');
    // Backend returns an array of arrays (rows from Google Sheets)
    const rows = res.data;
    // Transform rows into objects
    const assetsList = rows.map((row: any[], idx: number) => ({
      id: idx, // row index (0‑based, after header)
      institution: row[0],
      department: row[1],
      assetType: row[2],
      itemDescription: row[3],
      dateAcquired: row[4],
      value: parseFloat(row[5]),
      serialNumber: row[6],
      remarks: row[7],
    }));
    setAssets(assetsList);
  } catch (error) {
    toast.error('Failed to load assets');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      if (editingAsset) {
        await api.put(`/institution/assets/${editingAsset.id}`, formData);
        toast.success('Asset updated');
      } else {
        await api.post('/institution/assets', formData);
        toast.success('Asset added');
      }
      setModalOpen(false);
      setEditingAsset(null);
      setFormData({});
      fetchAssets();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/institution/assets/${id}`);
        toast.success('Asset deleted');
        fetchAssets();
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
    const assetData = rows.map(row => ({
      department: row['Department'],
      assetType: row['Asset Type'],
      itemDescription: row['Item Description'],
      dateAcquired: row['Date Acquired'],
      value: row['Value'],
      serialNumber: row['Serial Number'],
      remarks: row['Remarks']
    }));
    try {
      await api.post('/institution/assets/import', assetData);
      toast.success('Import successful');
      fetchAssets();
    } catch (error) {
      toast.error('Import failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/institution/assets/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assets.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      toast.error('Export failed');
    }
  };

const filteredAssets = assets.filter(a =>
  a.itemDescription?.toLowerCase().includes(search.toLowerCase()) ||
  a.department?.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingAsset(null); setFormData({}); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Asset
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
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by item or department" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="p-4 text-center">No assets found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Acquired</TableHead>
                  <TableHead>Value (KES)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.itemDescription}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>{asset.assetType}</TableCell>
                    <TableCell>{asset.dateAcquired}</TableCell>
                    <TableCell>{asset.value?.toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingAsset(asset); setFormData(asset); setModalOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}>
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
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
            <DialogDescription>Enter asset details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department *</Label>
              <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICT">ICT</SelectItem>
                  <SelectItem value="Garment Making">Garment Making</SelectItem>
                  <SelectItem value="Carpentry">Carpentry</SelectItem>
                  <SelectItem value="Motor Vehicle">Motor Vehicle</SelectItem>
                  <SelectItem value="Agribusiness">Agribusiness</SelectItem>
                  <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Welding">Welding</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Masonry">Masonry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Asset Type *</Label>
              <Select value={formData.assetType} onValueChange={(v) => setFormData({...formData, assetType: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPARTMENT_ASSET">Department Asset</SelectItem>
                  <SelectItem value="TOOL_EQUIPMENT">Tool / Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Item Description *</Label>
              <Input value={formData.itemDescription || ''} onChange={(e) => setFormData({...formData, itemDescription: e.target.value})} />
            </div>
            <div>
              <Label>Date Acquired</Label>
              <Input type="date" value={formData.dateAcquired || ''} onChange={(e) => setFormData({...formData, dateAcquired: e.target.value})} />
            </div>
            <div>
              <Label>Value (KES)</Label>
              <Input type="number" value={formData.value || ''} onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input value={formData.serialNumber || ''} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Remarks</Label>
              <Input value={formData.remarks || ''} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
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