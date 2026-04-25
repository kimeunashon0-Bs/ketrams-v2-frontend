"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface Asset {
  id: number;
  institution: string;
  department: string;
  assetType: string;
  itemDescription: string;
  dateAcquired: string;
  value: number;
  serialNumber: string;
  remarks: string;
}

export default function MinistryAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ministry/assets');
      const rows = res.data;
      const assetsList = rows.map((row: any[], idx: number) => ({
        id: idx,
        institution: row[0] || '',
        department: row[1] || '',
        assetType: row[2] || '',
        itemDescription: row[3] || '',
        dateAcquired: row[4] || '',
        value: parseFloat(row[5]) || 0,
        serialNumber: row[6] || '',
        remarks: row[7] || '',
      }));
      setAssets(assetsList);
    } catch (error) {
      toast.error('Failed to load assets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(a =>
    a.itemDescription.toLowerCase().includes(search.toLowerCase()) ||
    a.institution.toLowerCase().includes(search.toLowerCase()) ||
    a.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assets (All Institutions)</h1>
        <p className="text-muted-foreground">View assets across all polytechnics in the county</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item, institution, or department"
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
            <div className="p-4 text-center">Loading...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="p-4 text-center">No assets found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value (KES)</TableHead>
                  <TableHead>Date Acquired</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.institution}</TableCell>
                    <TableCell className="font-medium">{asset.itemDescription}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>{asset.assetType}</TableCell>
                    <TableCell>{asset.value.toLocaleString()}</TableCell>
                    <TableCell>{asset.dateAcquired}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}