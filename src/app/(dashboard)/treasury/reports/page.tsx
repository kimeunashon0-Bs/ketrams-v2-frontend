"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TreasuryReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/treasury/reports/summary');
      setReport(res.data.data);
    } catch (error) {
      console.error('Failed to load report', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;

  const statusData = Object.entries(report?.byStatus || {}).map(([name, value]) => ({ name, value }));
  const genderData = Object.entries(report?.byGender || {}).map(([name, value]) => ({ name, value }));
  const disabilityData = Object.entries(report?.byDisability || {}).map(([name, value]) => ({ name, value }));
  const wardData = Object.entries(report?.byWard || {}).map(([name, value]) => ({ name, value }));
  const institutionData = Object.entries(report?.byInstitution || {}).map(([name, value]) => ({ name, value }));
  const courseData = Object.entries(report?.byCourse || {}).map(([name, value]) => ({ name, value }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Applications by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#8884d8" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>By Gender</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>By Disability Status</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={disabilityData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#82ca9d" /></BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top 5 Wards</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={wardData.slice(0,5)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#ffc658" /></BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Applications by Institution</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={institutionData.slice(0,8)}><XAxis dataKey="name" angle={-45} textAnchor="end" height={80} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#ff8042" /></BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Course Popularity</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={courseData.slice(0,6)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#a4de6c" /></BarChart></ResponsiveContainer></CardContent>
        </Card>
      </div>
    </div>
  );
}