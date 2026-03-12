"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { format as formatDate } from 'date-fns';  // Renamed to avoid conflict
import {
  Download,
  Calendar,
  Users,
  BookOpen,
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportSummary {
  byStatus: Record<string, number>;
  byCourse: Record<string, number>;
  bySubCounty: Record<string, number>;
  byDisabilityStatus: Record<string, number>;
}

interface Application {
  id: number;
  student: {
    gender: string;
    disabilityStatus: string;
  };
  status: string;
}

interface StatusItem {
  name: string;
  value: number;
}

interface CourseItem {
  name: string;
  value: number;
}

interface SubCountyItem {
  name: string;
  value: number;
}

export default function InstitutionReportsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dateRange, setDateRange] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
    fetchApplications();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institution/reports/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/institution/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    }
  };

  const exportReport = async (format: string) => {
    try {
      const response = await api.get('/institution/reports/export/csv', {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `institution-report-${formatDate(new Date(), 'yyyyMMdd')}.csv`;  // Use renamed function
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  // Calculate real metrics from data
  const totalApplications = applications.length;
  const approved = applications.filter(a => a.status === 'APPROVED_BY_INSTITUTION').length;
  const pending = applications.filter(a => a.status === 'PENDING_INSTITUTION').length;
  const rejected = applications.filter(a => a.status === 'REJECTED_BY_INSTITUTION').length;
  
  const approvalRate = totalApplications > 0 
    ? Math.round((approved / totalApplications) * 100) 
    : 0;

  // Gender distribution
  const maleCount = applications.filter(a => a.student?.gender === 'M').length;
  const femaleCount = applications.filter(a => a.student?.gender === 'F').length;
  const otherGenderCount = applications.filter(a => a.student?.gender === 'OTHER').length;

  // PWD statistics
  const pwdCount = applications.filter(a => a.student?.disabilityStatus === 'PWD').length;
  const normalCount = applications.filter(a => a.student?.disabilityStatus === 'NORMAL').length;

  // Prepare data for charts
  const statusData: StatusItem[] = summary ? Object.entries(summary.byStatus).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value: value as number,
  })) : [];

  const courseData: CourseItem[] = summary ? Object.entries(summary.byCourse).map(([key, value]) => ({
    name: key,
    value: value as number,
  })).sort((a, b) => b.value - a.value) : [];

  const subCountyData: SubCountyItem[] = summary ? Object.entries(summary.bySubCounty).map(([key, value]) => ({
    name: key,
    value: value as number,
  })).sort((a, b) => b.value - a.value) : [];

  const topCourses = courseData.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track your institution's performance and application trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalApplications}</div>
                    <p className="text-xs text-muted-foreground">All time applications</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{approvalRate}%</div>
                    <p className="text-xs text-muted-foreground">{approved} approved out of {totalApplications}</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{courseData.length}</div>
                    <p className="text-xs text-muted-foreground">Courses with applications</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sub-Counties</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{subCountyData.length}</div>
                    <p className="text-xs text-muted-foreground">Active regions</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Current distribution of applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Pending</span>
                        </div>
                        <span className="font-medium">{pending}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(pending / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Approved</span>
                        </div>
                        <span className="font-medium">{approved}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(approved / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>Rejected</span>
                        </div>
                        <span className="font-medium">{rejected}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(rejected / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Top Courses</CardTitle>
                <CardDescription>Most applied courses</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : topCourses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No course data available</p>
                ) : (
                  <div className="space-y-4">
                    {topCourses.map((course) => (
                      <div key={course.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{course.name}</span>
                          <span className="font-medium">{course.value}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(course.value / topCourses[0].value) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Breakdown</CardTitle>
              <CardDescription>Detailed analysis by status and sub-county</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Pending</TableCell>
                        <TableCell>{pending}</TableCell>
                        <TableCell>{totalApplications > 0 ? Math.round((pending / totalApplications) * 100) : 0}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Approved</TableCell>
                        <TableCell>{approved}</TableCell>
                        <TableCell>{totalApplications > 0 ? Math.round((approved / totalApplications) * 100) : 0}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Rejected</TableCell>
                        <TableCell>{rejected}</TableCell>
                        <TableCell>{totalApplications > 0 ? Math.round((rejected / totalApplications) * 100) : 0}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Applications by Sub-County</h3>
                    {subCountyData.length === 0 ? (
                      <p className="text-muted-foreground">No sub-county data available</p>
                    ) : (
                      <div className="space-y-4">
                        {subCountyData.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="font-medium">{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${(item.value / subCountyData[0].value) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Applicants by gender</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Male</span>
                        <span className="font-medium">{maleCount} ({totalApplications > 0 ? Math.round((maleCount / totalApplications) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(maleCount / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Female</span>
                        <span className="font-medium">{femaleCount} ({totalApplications > 0 ? Math.round((femaleCount / totalApplications) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(femaleCount / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Other</span>
                        <span className="font-medium">{otherGenderCount} ({totalApplications > 0 ? Math.round((otherGenderCount / totalApplications) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(otherGenderCount / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disability Status</CardTitle>
                <CardDescription>PWD vs Normal distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Normal</span>
                        <span className="font-medium">{normalCount} ({totalApplications > 0 ? Math.round((normalCount / totalApplications) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(normalCount / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>PWD</span>
                        <span className="font-medium">{pwdCount} ({totalApplications > 0 ? Math.round((pwdCount / totalApplications) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: totalApplications > 0 ? `${(pwdCount / totalApplications) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Applications per course</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : courseData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No course data available</p>
              ) : (
                <div className="space-y-6">
                  {courseData.map((course) => (
                    <div key={course.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{course.name}</span>
                        <span className="font-medium">{course.value} applications</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(course.value / courseData[0].value) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}