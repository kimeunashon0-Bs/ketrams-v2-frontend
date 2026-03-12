"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  BookOpen,
  FileText,
  Download,
  TrendingUp
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DashboardStats {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  totalCourses: number;
  recentApplications: any[];
  courseStats: { name: string; count: number }[];
}

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalCourses: 0,
    recentApplications: [],
    courseStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      const appsRes = await api.get('/institution/applications');
      const applications = appsRes.data.data || [];
      
      const pending = applications.filter((a: any) => a.status === 'PENDING_INSTITUTION').length;
      const approved = applications.filter((a: any) => a.status === 'APPROVED_BY_INSTITUTION').length;
      const rejected = applications.filter((a: any) => a.status === 'REJECTED_BY_INSTITUTION').length;

      // Fetch courses
      const coursesRes = await api.get('/institution/courses');
      const courses = coursesRes.data;
      const totalCourses = courses.length;

      // Calculate course stats (applications per course)
      const courseStats = courses.map((course: any) => ({
        name: course.name,
        count: applications.filter((a: any) => a.course.id === course.id).length
      })).sort((a: any, b: any) => b.count - a.count);

      // Get 5 most recent applications
      const recentApplications = applications
        .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5);

      setStats({
        totalApplications: applications.length,
        pending,
        approved,
        rejected,
        totalCourses,
        recentApplications,
        courseStats
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
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

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Institution Admin'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your applications today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {user?.institutionName}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">All time applications</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">Ready for sub-county</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">Across {stats.totalApplications} applications</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Quick Actions - 2 columns */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/institution/applications')}
            >
              <Users className="mr-2 h-4 w-4" />
              Review Applications
              {stats.pending > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {stats.pending} pending
                </Badge>
              )}
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/institution/courses')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Courses
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/institution/reports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.open('/api/institution/reports/export/csv', '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        {/* Recent Applications - 5 columns */}
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest student applications to review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/institution/applications')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stats.recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No recent applications</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => router.push('/institution/applications')}
                >
                  Go to applications
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentApplications.map((app: any) => (
                    <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{app.student.fullName}</TableCell>
                      <TableCell>{app.course.name}</TableCell>
                      <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/institution/applications?id=${app.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Courses Section */}
      {stats.courseStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Courses</CardTitle>
            <CardDescription>Most applied courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.courseStats.slice(0, 5).map((course) => (
                <div key={course.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{course.name}</span>
                    <span className="font-medium">{course.count} applications</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: stats.courseStats[0].count > 0 ? `${(course.count / stats.courseStats[0].count) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}