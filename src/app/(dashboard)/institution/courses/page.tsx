"use client";

import { useEffect, useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Eye, Plus } from 'lucide-react';
import api from '@/lib/api/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  id: number;
  name: string;
  level: string;
  category: string;
  enabled: boolean;
}

interface CourseFormData {
  name: string;
  level: string;
  category: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { setFilterFields, filterValues } = useDashboard();

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    level: '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Define filters for this page
    setFilterFields([
      { key: 'name', label: 'Course Name', type: 'text' },
      { key: 'level', label: 'Level', type: 'select', options: [
        { value: 'Certificate', label: 'Certificate' },
        { value: 'Diploma', label: 'Diploma' },
      ]},
      { key: 'enabled', label: 'Status', type: 'select', options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ]},
    ]);
  }, [setFilterFields]);

  useEffect(() => {
    fetchCourses();
  }, [filterValues]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institution/courses');
      let data = response.data;
      // Apply client-side filtering (replace with server-side when available)
      if (filterValues.name) {
        data = data.filter((c: Course) =>
          c.name.toLowerCase().includes(filterValues.name.toLowerCase())
        );
      }
      if (filterValues.level) {
        data = data.filter((c: Course) => c.level === filterValues.level);
      }
      if (filterValues.enabled !== undefined && filterValues.enabled !== '') {
        const enabledBool = filterValues.enabled === 'true';
        data = data.filter((c: Course) => c.enabled === enabledBool);
      }
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/institution/courses/${id}/toggle`, { enabled: !currentStatus });
      fetchCourses();
    } catch (error) {
      console.error('Failed to toggle course', error);
    }
  };

  // Add Course
  const handleAddCourse = () => {
    setFormData({ name: '', level: '', category: '' });
    setIsAddDialogOpen(true);
  };

  const submitAddCourse = async () => {
    setSubmitting(true);
    try {
      await api.post('/institution/courses', formData);
      setIsAddDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Failed to add course', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Course
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      level: course.level,
      category: course.category,
    });
    setIsEditDialogOpen(true);
  };

  const submitEditCourse = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    try {
      // Changed from PATCH to PUT (server only allows PUT/DELETE on this endpoint)
      await api.put(`/institution/courses/${selectedCourse.id}`, formData);
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error: any) {
      console.error('Update failed:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // View Course
  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button onClick={handleAddCourse}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No courses found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{course.level}</Badge>
                  <span>{course.category}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={course.enabled ? 'default' : 'secondary'}>
                      {course.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={course.enabled}
                      onCheckedChange={() => toggleCourse(course.id, course.enabled)}
                      aria-label="Toggle course status"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCourse(course)}
                      title="Edit course"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewCourse(course)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course for your institution.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Information Technology"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Computing, Business"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAddCourse} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Course Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger id="edit-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditCourse} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Course Name</Label>
                <p className="text-sm text-muted-foreground">{selectedCourse.name}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Level</Label>
                <p className="text-sm text-muted-foreground">{selectedCourse.level}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Category</Label>
                <p className="text-sm text-muted-foreground">{selectedCourse.category}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse.enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}