"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ChevronDown,
  MoreHorizontal,
  FileText,
  User,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  GraduationCap as GradIcon,
  Shield,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Application {
  id: number;
  student: {
    userId: number;
    fullName: string;
    gender: string;
    disabilityStatus: string;
    subCounty: string;
    ward: string;
    idNumber: string;
    phoneNumber: string;
  };
  course: {
    id: number;
    name: string;
    level: string;
    category: string;
  };
  status: string;
  appliedAt: string;
  institutionRemarks: string | null;
  institutionReviewedAt: string | null;
}

interface WalkinStudentData {
  fullName: string;
  gender: string;
  disabilityStatus: string;
  idNumber: string;
  birthCertNumber?: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string;
  county: string;
  subCounty: string;
  ward: string;
  location?: string;
  sublocation?: string;
  previousSchool: string;
  highestQualification: string;
  phoneNumber: string;
  email?: string;
}

export default function InstitutionApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    courseId: '',
    subCounty: '',
    status: '',
    dateRange: '',
    search: '',
  });

  // Walk-in state
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinStep, setWalkinStep] = useState(1);
  const [studentData, setStudentData] = useState<WalkinStudentData>({
    fullName: '',
    gender: '',
    disabilityStatus: 'NORMAL',
    idNumber: '',
    birthCertNumber: '',
    parentName: '',
    parentPhone: '',
    parentRelationship: '',
    county: 'Kakamega',
    subCounty: '',
    ward: '',
    location: '',
    sublocation: '',
    previousSchool: '',
    highestQualification: '',
    phoneNumber: '',
    email: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [existingUser, setExistingUser] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subCounties, setSubCounties] = useState<{ id: number; name: string }[]>([]);
  const [wards, setWards] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchApplications();
    fetchCourses();
    fetchSubCounties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institution/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/institution/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const fetchSubCounties = async () => {
    try {
      const res = await api.get('/subcounties');
      setSubCounties(res.data);
    } catch (error) {
      console.error('Failed to fetch sub-counties', error);
    }
  };

  const fetchWards = async (subCountyId: number) => {
    try {
      const res = await api.get(`/wards?subCountyId=${subCountyId}`);
      setWards(res.data);
    } catch (error) {
      console.error('Failed to fetch wards', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];
    if (filters.search) {
      filtered = filtered.filter(app =>
        app.student.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.student.idNumber.includes(filters.search)
      );
    }
    if (filters.courseId) {
      filtered = filtered.filter(app => app.course.id === parseInt(filters.courseId));
    }
    if (filters.subCounty) {
      filtered = filtered.filter(app => app.student.subCounty === filters.subCounty);
    }
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }
    setFilteredApps(filtered);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      await api.post(`/institution/applications/${selectedApp.id}/approve?remarks=${encodeURIComponent(remarks)}`);
      await fetchApplications();
      setShowActionModal(false);
      setSelectedApp(null);
      setRemarks('');
      toast.success('Application approved');
    } catch (error) {
      console.error('Failed to approve', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      await api.post(`/institution/applications/${selectedApp.id}/reject?remarks=${encodeURIComponent(remarks)}`);
      await fetchApplications();
      setShowActionModal(false);
      setSelectedApp(null);
      setRemarks('');
      toast.success('Application rejected');
    } catch (error) {
      console.error('Failed to reject', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewStudent = async (studentId: number) => {
    try {
      const response = await api.get(`/institution/students/${studentId}`);
      console.log('Student details:', response.data);
      toast.info('Student details logged to console');
    } catch (error) {
      console.error('Failed to fetch student details', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PENDING_INSTITUTION: { variant: "secondary", label: "Pending" },
      APPROVED_BY_INSTITUTION: { variant: "default", label: "Approved" },
      REJECTED_BY_INSTITUTION: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSubCounties = () => {
    return [...new Set(applications.map(app => app.student.subCounty))];
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Student Name', 'ID Number', 'Course', 'Level', 'Sub-County', 'Ward', 'Status', 'Applied Date'];
    const data = filteredApps.map(app => [
      app.id,
      app.student.fullName,
      app.student.idNumber,
      app.course.name,
      app.course.level,
      app.student.subCounty,
      app.student.ward,
      app.status,
      format(new Date(app.appliedAt), 'dd/MM/yyyy')
    ]);
    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  // Walk-in helpers
  const handleSubCountyChange = (subCountyName: string) => {
    setStudentData({ ...studentData, subCounty: subCountyName, ward: '' });
    const selected = subCounties.find(sc => sc.name === subCountyName);
    if (selected) fetchWards(selected.id);
  };

  const handleSendWalkinOtp = async () => {
    setProcessing(true);
    setOtpError('');
    try {
      await api.post('/auth/walkin-request-otp', {
        phoneNumber: studentData.phoneNumber,
        email: studentData.email || undefined,
        deliveryMethod: 'PHONE',
        walkin: true,
      });
      setOtpSent(true);
      setWalkinStep(2);
      toast.success('OTP sent to the provided phone number');
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Please check the phone number.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyWalkinOtp = async () => {
    setProcessing(true);
    setOtpError('');
    try {
      await api.post('/auth/verify-otp', {
        phoneNumber: studentData.phoneNumber,
        otpCode: otpCode,
      });
      // Check if user already exists
      const userCheck = await api.get(`/users/by-phone/${studentData.phoneNumber}`);
      setExistingUser(userCheck.data);
      setWalkinStep(3);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setExistingUser(null);
        setWalkinStep(3);
      } else {
        setOtpError(err.response?.data?.message || 'Invalid OTP');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitWalkinApplication = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }
    setProcessing(true);
    try {
      let userId = existingUser?.id;
      if (!existingUser) {
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const createUserRes = await api.post('/auth/register', {
          phoneNumber: studentData.phoneNumber,
          email: studentData.email,
          fullName: studentData.fullName,
          gender: studentData.gender,
          disabilityStatus: studentData.disabilityStatus,
          idNumber: studentData.idNumber,
          birthCertNumber: studentData.birthCertNumber,
          parentName: studentData.parentName,
          parentPhone: studentData.parentPhone,
          parentRelationship: studentData.parentRelationship,
          county: studentData.county,
          subCounty: studentData.subCounty,
          ward: studentData.ward,
          location: studentData.location,
          sublocation: studentData.sublocation,
          previousSchool: studentData.previousSchool,
          highestQualification: studentData.highestQualification,
          password: tempPassword,
        });
        userId = createUserRes.data.userId;
        await api.post('/auth/send-temp-password', {
          phoneNumber: studentData.phoneNumber,
          password: tempPassword,
        });
        toast.success('Student account created. Temporary password sent via SMS.');
      }
      await api.post('/institution/applications/walkin', {
        studentId: userId,
        courseId: parseInt(selectedCourseId),
      });
      toast.success('Application created successfully');
      setShowWalkinModal(false);
      resetWalkinModal();
      fetchApplications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create application');
    } finally {
      setProcessing(false);
    }
  };

  const resetWalkinModal = () => {
    setWalkinStep(1);
    setStudentData({
      fullName: '',
      gender: '',
      disabilityStatus: 'NORMAL',
      idNumber: '',
      birthCertNumber: '',
      parentName: '',
      parentPhone: '',
      parentRelationship: '',
      county: 'Kakamega',
      subCounty: '',
      ward: '',
      location: '',
      sublocation: '',
      previousSchool: '',
      highestQualification: '',
      phoneNumber: '',
      email: '',
    });
    setOtpCode('');
    setOtpSent(false);
    setOtpError('');
    setExistingUser(null);
    setSelectedCourseId('');
  };

  // Walk-in modal step renderers
  const renderStudentForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input value={studentData.fullName} onChange={(e) => setStudentData({...studentData, fullName: e.target.value})} />
        </div>
        <div>
          <Label>Gender *</Label>
          <Select value={studentData.gender} onValueChange={(v) => setStudentData({...studentData, gender: v})}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ID Number *</Label>
          <Input value={studentData.idNumber} onChange={(e) => setStudentData({...studentData, idNumber: e.target.value})} />
        </div>
        <div>
          <Label>Birth Certificate Number</Label>
          <Input value={studentData.birthCertNumber} onChange={(e) => setStudentData({...studentData, birthCertNumber: e.target.value})} />
        </div>
      </div>
      <div>
        <Label>Disability Status</Label>
        <Select value={studentData.disabilityStatus} onValueChange={(v) => setStudentData({...studentData, disabilityStatus: v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="PWD">Person with Disability (PWD)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <h4 className="font-medium">Parent/Guardian Information</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Parent Name *</Label>
          <Input value={studentData.parentName} onChange={(e) => setStudentData({...studentData, parentName: e.target.value})} />
        </div>
        <div>
          <Label>Parent Phone *</Label>
          <Input value={studentData.parentPhone} onChange={(e) => setStudentData({...studentData, parentPhone: e.target.value})} />
        </div>
      </div>
      <div>
        <Label>Relationship *</Label>
        <Input value={studentData.parentRelationship} onChange={(e) => setStudentData({...studentData, parentRelationship: e.target.value})} />
      </div>
      <Separator />
      <h4 className="font-medium">Location</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>County</Label>
          <Input value={studentData.county} disabled className="bg-muted" />
        </div>
        <div>
          <Label>Sub-County *</Label>
          <Select value={studentData.subCounty} onValueChange={handleSubCountyChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {subCounties.map(sc => <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ward *</Label>
          <Select value={studentData.ward} onValueChange={(v) => setStudentData({...studentData, ward: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {wards.map(w => <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location (optional)</Label>
          <Input value={studentData.location} onChange={(e) => setStudentData({...studentData, location: e.target.value})} />
        </div>
      </div>
      <div>
        <Label>Sublocation (optional)</Label>
        <Input value={studentData.sublocation} onChange={(e) => setStudentData({...studentData, sublocation: e.target.value})} />
      </div>
      <Separator />
      <h4 className="font-medium">Academic Background</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Previous School</Label>
          <Input value={studentData.previousSchool} onChange={(e) => setStudentData({...studentData, previousSchool: e.target.value})} />
        </div>
        <div>
          <Label>Highest Qualification</Label>
          <Input value={studentData.highestQualification} onChange={(e) => setStudentData({...studentData, highestQualification: e.target.value})} />
        </div>
      </div>
      <Separator />
      <h4 className="font-medium">Contact for OTP</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Phone Number *</Label>
          <Input value={studentData.phoneNumber} onChange={(e) => setStudentData({...studentData, phoneNumber: e.target.value})} />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input value={studentData.email} onChange={(e) => setStudentData({...studentData, email: e.target.value})} />
        </div>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-4">
      <Alert>
        <Phone className="h-4 w-4" />
        <AlertDescription>
          An OTP has been sent to {studentData.phoneNumber}. Please enter it below.
        </AlertDescription>
      </Alert>
      <div>
        <Label>OTP Code</Label>
        <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
      </div>
      {otpError && <p className="text-sm text-red-600">{otpError}</p>}
      <Button variant="outline" onClick={handleSendWalkinOtp} disabled={processing}>Resend OTP</Button>
    </div>
  );

  const renderCourseStep = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Course *</Label>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger><SelectValue placeholder="Choose a course" /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {existingUser ? (
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            Student already exists. Application will be linked to existing account.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <GradIcon className="h-4 w-4" />
          <AlertDescription>
            New student account will be created and a temporary password sent via SMS.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with walk-in button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Review and manage student applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowWalkinModal(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Walk-in Application
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
            <Select value={filters.courseId} onValueChange={(value) => setFilters({ ...filters, courseId: value })}>
              <SelectTrigger><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent>
                {courses.map(course => <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.subCounty} onValueChange={(value) => setFilters({ ...filters, subCounty: value })}>
              <SelectTrigger><SelectValue placeholder="All Sub-Counties" /></SelectTrigger>
              <SelectContent>
                {getSubCounties().map(subCounty => <SelectItem key={subCounty} value={subCounty}>{subCounty}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING_INSTITUTION">Pending</SelectItem>
                <SelectItem value="APPROVED_BY_INSTITUTION">Approved</SelectItem>
                <SelectItem value="REJECTED_BY_INSTITUTION">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
              <SelectTrigger><SelectValue placeholder="Date Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No applications found</p>
              <Button variant="link" className="mt-2" onClick={() => setFilters({ courseId: '', subCounty: '', status: '', dateRange: '', search: '' })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Student</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Sub-County</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback>{app.student.fullName[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-sm font-medium">{app.student.fullName}</p>
                          <p className="text-xs text-muted-foreground">{app.student.gender}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{app.student.idNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{app.course.name}</p>
                        <p className="text-xs text-muted-foreground">{app.course.level}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.student.subCounty}</TableCell>
                    <TableCell>{format(new Date(app.appliedAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedApp(app); setShowDetails(true); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewStudent(app.student.userId)}>
                            <User className="mr-2 h-4 w-4" /> View Student
                          </DropdownMenuItem>
                          {app.status === 'PENDING_INSTITUTION' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setSelectedApp(app); setActionType('approve'); setShowActionModal(true); }} className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedApp(app); setActionType('reject'); setShowActionModal(true); }} className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the complete application information</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><h4 className="text-sm font-medium">Student Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedApp.student.fullName}</p>
                    <p><span className="text-muted-foreground">ID:</span> {selectedApp.student.idNumber}</p>
                    <p><span className="text-muted-foreground">Gender:</span> {selectedApp.student.gender}</p>
                    <p><span className="text-muted-foreground">PWD:</span> {selectedApp.student.disabilityStatus}</p>
                  </div>
                </div>
                <div><h4 className="text-sm font-medium">Course Details</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Course:</span> {selectedApp.course.name}</p>
                    <p><span className="text-muted-foreground">Level:</span> {selectedApp.course.level}</p>
                    <p><span className="text-muted-foreground">Category:</span> {selectedApp.course.category}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div><h4 className="text-sm font-medium">Location & Contact</h4>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-muted-foreground">Sub-County:</span> {selectedApp.student.subCounty}</p>
                  <p><span className="text-muted-foreground">Ward:</span> {selectedApp.student.ward}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedApp.student.phoneNumber}</p>
                </div>
              </div>
              <Separator />
              <div><h4 className="text-sm font-medium">Application Timeline</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Applied:</span> {format(new Date(selectedApp.appliedAt), 'dd MMM yyyy, HH:mm')}</p>
                  {selectedApp.institutionReviewedAt && <p><span className="text-muted-foreground">Reviewed:</span> {format(new Date(selectedApp.institutionReviewedAt), 'dd MMM yyyy, HH:mm')}</p>}
                  {selectedApp.institutionRemarks && <p><span className="text-muted-foreground">Remarks:</span> {selectedApp.institutionRemarks}</p>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal (Approve/Reject) */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Approve Application' : 'Reject Application'}</DialogTitle>
            <DialogDescription>{actionType === 'approve' ? 'This application will be marked as approved and forwarded to sub-county' : 'Please provide a reason for rejection'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedApp && (
              <>
                <div><Label>Student</Label><p className="text-sm">{selectedApp.student.fullName}</p></div>
                <div><Label>Course</Label><p className="text-sm">{selectedApp.course.name}</p></div>
                <div><Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Optional remarks...'} rows={3} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
            <Button onClick={actionType === 'approve' ? handleApprove : handleReject} disabled={processing || (actionType === 'reject' && !remarks)} variant={actionType === 'approve' ? 'default' : 'destructive'}>
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Walk-in Modal */}
      <Dialog open={showWalkinModal} onOpenChange={(open) => { if (!open) resetWalkinModal(); setShowWalkinModal(open); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {walkinStep === 1 && "Walk-in Application - Student Details"}
              {walkinStep === 2 && "Verify Phone Number"}
              {walkinStep === 3 && "Select Course"}
            </DialogTitle>
            <DialogDescription>
              {walkinStep === 1 && "Enter the student's personal and academic information."}
              {walkinStep === 2 && "We've sent a verification code to the provided phone number."}
              {walkinStep === 3 && "Choose the course the student wants to apply for."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {walkinStep === 1 && renderStudentForm()}
            {walkinStep === 2 && renderOtpStep()}
            {walkinStep === 3 && renderCourseStep()}
          </div>
          <DialogFooter>
            {walkinStep > 1 && <Button variant="outline" onClick={() => setWalkinStep(walkinStep - 1)}>Back</Button>}
            {walkinStep === 1 && <Button onClick={handleSendWalkinOtp} disabled={!studentData.fullName || !studentData.phoneNumber || !studentData.idNumber}>Continue</Button>}
            {walkinStep === 2 && <Button onClick={handleVerifyWalkinOtp} disabled={!otpCode || processing}>Verify OTP</Button>}
            {walkinStep === 3 && <Button onClick={handleSubmitWalkinApplication} disabled={!selectedCourseId || processing}>Submit Application</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}