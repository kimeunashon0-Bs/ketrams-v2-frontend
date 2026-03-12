"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  FileText,
  Bell,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/lib/auth/AuthContext';
import api from '@/lib/api/axios';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: Record<string, NavSection[]> = {
  institution: [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/institution/dashboard', icon: Home },
        { name: 'Applications', href: '/institution/applications', icon: Users },
        { name: 'Courses', href: '/institution/courses', icon: BookOpen },
        { name: 'Reports', href: '/institution/reports', icon: BarChart3 },
      ]
    },
    {
      title: 'Settings',
      items: [
        { name: 'Profile', href: '/institution/profile', icon: Settings },
      ]
    }
  ],
  student: [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/student/dashboard', icon: Home },
        { name: 'My Profile', href: '/student/profile', icon: Users },
        { name: 'Applications', href: '/student/applications', icon: FileText },
        { name: 'Explore', href: '/student/institutions', icon: Building2 },
      ]
    }
  ],
  subcounty: [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/subcounty/dashboard', icon: Home },
        { name: 'Applications', href: '/subcounty/applications', icon: Users },
        { name: 'Reports', href: '/subcounty/reports', icon: BarChart3 },
      ]
    }
  ],
  admin: [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { name: 'Institutions', href: '/admin/institutions', icon: Building2 },
        { name: 'Users', href: '/admin/institution-users', icon: Users },
        { name: 'Requests', href: '/admin/institution-requests', icon: FileText },
      ]
    }
  ]
};

export function DashboardSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Determine which nav to show based on user role
  const role = user?.role?.toLowerCase() || 'student';
  const navSections = navigation[role] || navigation.student;

  // Fetch real data
  useEffect(() => {
    if (user?.role === 'INSTITUTION') {
      fetchInstitutionData();
    } else if (user?.role === 'SUB_COUNTY') {
      fetchSubCountyData();
    } else if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  const fetchInstitutionData = async () => {
    try {
      const appsRes = await api.get('/institution/applications');
      const pending = appsRes.data.data.filter((a: any) => a.status === 'PENDING_INSTITUTION').length;
      setPendingCount(pending);
      
      // Mock notifications - replace with real endpoint
      setNotifications([
        { id: 1, title: 'New Application', message: '5 new applications received', time: '5 min ago' },
        { id: 2, title: 'Course Update', message: 'ICT course was updated', time: '1 hour ago' },
      ]);
    } catch (error) {
      console.error('Failed to fetch institution data', error);
    }
  };

  const fetchSubCountyData = async () => {
    try {
      const appsRes = await api.get('/subcounty/applications');
      const pending = appsRes.data.data.filter((a: any) => 
        a.status === 'APPROVED_BY_INSTITUTION' || a.status === 'PENDING_SUB_COUNTY'
      ).length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Failed to fetch sub-county data', error);
    }
  };

  const fetchAdminData = async () => {
    try {
      const requestsRes = await api.get('/admin/institution-requests');
      const pending = requestsRes.data.filter((r: any) => r.status === 'PENDING').length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.phoneNumber?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo area with collapse button */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
            <span className="text-xl font-bold">KETRAMS</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User info */}
      <div className={cn("border-b p-4", isCollapsed && "flex justify-center")}>
        {isCollapsed ? (
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || user?.phoneNumber}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
                {user?.institutionName && ` • ${user.institutionName}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {navSections.map((section, idx) => (
          <div key={section.title} className={cn("mb-6", idx > 0 && "mt-6")}>
            {!isCollapsed && (
              <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                {section.title}
              </h4>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const showBadge = item.name === 'Applications' && pendingCount > 0;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {showBadge && (
                          <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                            {pendingCount}
                          </Badge>
                        )}
                      </>
                    )}
                    {isCollapsed && showBadge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                      >
                        {pendingCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      {/* Footer with logout */}
      <div className="border-t p-4">
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 text-red-500" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}