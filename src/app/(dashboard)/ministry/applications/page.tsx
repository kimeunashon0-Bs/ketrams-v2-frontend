"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: number;
  student: {
    userId: number;
    fullName: string;
    gender: string;
    disabilityStatus: string;
    ward: string;
    subCounty: string;
    idNumber: string;
    phoneNumber: string;
  };
  institution: {
    id: number;
    name: string;
    subCounty: { name: string };
  };
  course: {
    name: string;
  };
  status: string;
  reported: boolean;
  appliedAt: string;
}

interface Institution {
  id: number;
  name: string;
}

export default function MinistryApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    institutionId: '',
    ward: '',
    courseId: '',
    subCounty: '',
    gender: '',
    disabilityStatus: '',
    status: '',
    reported: '',
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchInstitutions();
    fetchCourses();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.institutionId) params.institutionId = filters.institutionId;
      if (filters.ward) params.ward = filters.ward;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.subCounty) params.subCounty = filters.subCounty;
      if (filters.gender) params.gender = filters.gender;
      if (filters.disabilityStatus) params.disabilityStatus = filters.disabilityStatus;
      if (filters.status) params.status = filters.status;
      if (filters.reported !== '') params.reported = filters.reported === 'true';
      const res = await api.get('/ministry/applications', { params });
      const apps = res.data.data as Application[];
      setApplications(apps);
      // FIX: filter out empty ward strings
      const uniqueWards = [...new Set(
        apps.map(app => app.student.ward || '').filter(w => w.trim() !== '')
      )];
      setWards(uniqueWards);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const res = await api.get('/ministry/institutions');
      setInstitutions(res.data);
    } catch (error) {
      console.error('Failed to load institutions');
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/ministry/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to load courses', error);
      setCourses([]);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchApplications();
  };

  const exportCSV = async () => {
    try {
      const params: any = {};
      if (filters.institutionId) params.institutionId = filters.institutionId;
      if (filters.ward) params.ward = filters.ward;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.subCounty) params.subCounty = filters.subCounty;
      if (filters.gender) params.gender = filters.gender;
      if (filters.disabilityStatus) params.disabilityStatus = filters.disabilityStatus;
      if (filters.status) params.status = filters.status;
      if (filters.reported !== '') params.reported = filters.reported === 'true';
      const res = await api.get('/ministry/applications/export/csv', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ministry-applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING_INSTITUTION: 'bg-yellow-100 text-yellow-800',
      APPROVED_BY_INSTITUTION: 'bg-blue-100 text-blue-800',
      VERIFIED: 'bg-green-100 text-green-800',
      FACILITATED: 'bg-purple-100 text-purple-800',
      REJECTED_BY_INSTITUTION: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const viewStudentProfile = async (studentId: number) => {
    try {
      const res = await api.get(`/ministry/students/${studentId}`);
      setSelectedStudent(res.data);
      setStudentModalOpen(true);
    } catch (error) {
      toast.error('Failed to load student profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Applications (All Sub‑Counties)</h1>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={filters.institutionId} onValueChange={(v) => handleFilterChange('institutionId', v)}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                {institutions.map(inst => <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* FIX: filter out empty wards before mapping */}
            <Select value={filters.ward} onValueChange={(v) => handleFilterChange('ward', v)}>
              <SelectTrigger><SelectValue placeholder="Ward" /></SelectTrigger>
              <SelectContent>
                {wards.filter(w => w && w.trim() !== '').map(w => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.courseId} onValueChange={(v) => handleFilterChange('courseId', v)}>
              <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.subCounty} onValueChange={(v) => handleFilterChange('subCounty', v)}>
              <SelectTrigger><SelectValue placeholder="Sub‑County" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lurambi">Lurambi</SelectItem>
                <SelectItem value="Butere">Butere</SelectItem>
                <SelectItem value="Ikolomani">Ikolomani</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.gender} onValueChange={(v) => handleFilterChange('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.disabilityStatus} onValueChange={(v) => handleFilterChange('disabilityStatus', v)}>
              <SelectTrigger><SelectValue placeholder="Disability" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="PWD">PWD</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING_INSTITUTION">Pending Institution</SelectItem>
                <SelectItem value="APPROVED_BY_INSTITUTION">Approved by Institution</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="FACILITATED">Facilitated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.reported === '' ? 'all' : filters.reported} onValueChange={(v) => handleFilterChange('reported', v === 'all' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Reported Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Reported</SelectItem>
                <SelectItem value="false">Not Reported</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={applyFilters} className="gap-2">
              <Search className="h-4 w-4" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="p-4 text-center">No applications found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Sub‑County</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <button
                        onClick={() => viewStudentProfile(app.student.userId)}
                        className="text-indigo-600 hover:underline"
                      >
                        {app.student.fullName}
                      </button>
                    </TableCell>
                    <TableCell>{app.course.name}</TableCell>
                    <TableCell>{app.institution.name}</TableCell>
                    <TableCell>{app.institution.subCounty?.name}</TableCell>
                    <TableCell>{app.student.ward}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      {app.reported ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(app.appliedAt), 'dd MMM yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Personal and academic information</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Personal Information</h3>
                <p>Full Name: {selectedStudent.fullName}</p>
                <p>Gender: {selectedStudent.gender}</p>
                <p>Disability Status: {selectedStudent.disabilityStatus}</p>
                <p>ID Number: {selectedStudent.idNumber}</p>
                <p>Birth Certificate: {selectedStudent.birthCertNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold">Parent/Guardian</h3>
                <p>Name: {selectedStudent.parentName}</p>
                <p>Phone: {selectedStudent.parentPhone}</p>
                <p>Relationship: {selectedStudent.parentRelationship}</p>
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p>County: {selectedStudent.county}</p>
                <p>Sub-County: {selectedStudent.subCounty}</p>
                <p>Ward: {selectedStudent.ward}</p>
                <p>Location: {selectedStudent.location}</p>
                <p>Sublocation: {selectedStudent.sublocation}</p>
              </div>
              <div>
                <h3 className="font-semibold">Academic Background</h3>
                <p>Previous School: {selectedStudent.previousSchool}</p>
                <p>Highest Qualification: {selectedStudent.highestQualification}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}