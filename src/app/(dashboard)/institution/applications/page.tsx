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
  User
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

interface FilterOptions {
  courseId: string;
  subCounty: string;
  status: string;
  dateRange: string;
  search: string;
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
  const [filters, setFilters] = useState<FilterOptions>({
    courseId: '',
    subCounty: '',
    status: '',
    dateRange: '',
    search: '',
  });

  useEffect(() => {
    fetchApplications();
    fetchCourses();
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
    } catch (error) {
      console.error('Failed to approve', error);
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
    } catch (error) {
      console.error('Failed to reject', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewStudent = async (studentId: number) => {
    try {
      const response = await api.get(`/institution/students/${studentId}`);
      // You can show student details in a modal
      console.log('Student details:', response.data);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Review and manage student applications
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>

            {/* Course filter */}
            <Select
              value={filters.courseId}
              onValueChange={(value) => setFilters({ ...filters, courseId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sub-county filter */}
            <Select
              value={filters.subCounty}
              onValueChange={(value) => setFilters({ ...filters, subCounty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sub-Counties" />
              </SelectTrigger>
              <SelectContent>
                {getSubCounties().map((subCounty) => (
                  <SelectItem key={subCounty} value={subCounty}>
                    {subCounty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING_INSTITUTION">Pending</SelectItem>
                <SelectItem value="APPROVED_BY_INSTITUTION">Approved</SelectItem>
                <SelectItem value="REJECTED_BY_INSTITUTION">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range filter */}
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
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
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setFilters({ courseId: '', subCounty: '', status: '', dateRange: '', search: '' })}
              >
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
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{app.student.fullName[0]}</AvatarFallback>
                        </Avatar>
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
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedApp(app); setShowDetails(true); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewStudent(app.student.userId)}>
                            <User className="mr-2 h-4 w-4" />
                            View Student
                          </DropdownMenuItem>
                          {app.status === 'PENDING_INSTITUTION' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => { setSelectedApp(app); setActionType('approve'); setShowActionModal(true); }}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => { setSelectedApp(app); setActionType('reject'); setShowActionModal(true); }}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
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
            <DialogDescription>
              Review the complete application information
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Student Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedApp.student.fullName}</p>
                    <p><span className="text-muted-foreground">ID:</span> {selectedApp.student.idNumber}</p>
                    <p><span className="text-muted-foreground">Gender:</span> {selectedApp.student.gender}</p>
                    <p><span className="text-muted-foreground">PWD:</span> {selectedApp.student.disabilityStatus}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Course Details</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Course:</span> {selectedApp.course.name}</p>
                    <p><span className="text-muted-foreground">Level:</span> {selectedApp.course.level}</p>
                    <p><span className="text-muted-foreground">Category:</span> {selectedApp.course.category}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium">Location & Contact</h4>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-muted-foreground">Sub-County:</span> {selectedApp.student.subCounty}</p>
                  <p><span className="text-muted-foreground">Ward:</span> {selectedApp.student.ward}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedApp.student.phoneNumber}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium">Application Timeline</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Applied:</span> {format(new Date(selectedApp.appliedAt), 'dd MMM yyyy, HH:mm')}</p>
                  {selectedApp.institutionReviewedAt && (
                    <p><span className="text-muted-foreground">Reviewed:</span> {format(new Date(selectedApp.institutionReviewedAt), 'dd MMM yyyy, HH:mm')}</p>
                  )}
                  {selectedApp.institutionRemarks && (
                    <p><span className="text-muted-foreground">Remarks:</span> {selectedApp.institutionRemarks}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal (Approve/Reject) */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This application will be marked as approved and forwarded to sub-county'
                : 'Please provide a reason for rejection'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedApp && (
              <>
                <div className="space-y-1">
                  <Label>Student</Label>
                  <p className="text-sm">{selectedApp.student.fullName}</p>
                </div>
                <div className="space-y-1">
                  <Label>Course</Label>
                  <p className="text-sm">{selectedApp.course.name}</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Optional remarks...'}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={processing || (actionType === 'reject' && !remarks)}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}