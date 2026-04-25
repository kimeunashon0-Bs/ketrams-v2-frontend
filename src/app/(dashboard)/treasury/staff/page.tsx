"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Staff {
  id: number;
  institution: { name: string };
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

export default function SubCountyStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/treasury/staff');
      setStaffList(res.data);
    } catch (error) {
      console.error('Failed to load staff', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.institution.name.toLowerCase().includes(search.toLowerCase()) ||
    s.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Records (All Institutions)</h1>
        <p className="text-muted-foreground">View staff across all institutions in your sub‑county</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, institution, or designation" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
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
                  <TableHead>Institution</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Staff Type</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.institution.name}</TableCell>
                    <TableCell className="font-medium">{staff.fullName}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.staffType}</TableCell>
                    <TableCell>{staff.designation}</TableCell>
                    <TableCell>{staff.phoneNumber}</TableCell>
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