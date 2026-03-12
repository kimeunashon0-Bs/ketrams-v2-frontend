"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/lib/auth/AuthContext';
import api from '@/lib/api/axios';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'application' | 'request' | 'system';
}

export function DashboardHeader() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mounted, setMounted] = useState(false); // <-- Add mounted state

  useEffect(() => {
    setMounted(true); // <-- Mark as mounted after hydration
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Mock notifications - replace with real endpoint when available
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: 'New Application',
          message: 'A student applied to ICT course',
          time: '5 minutes ago',
          read: false,
          type: 'application'
        },
        {
          id: 2,
          title: 'Request Approved',
          message: 'Your course update was approved',
          time: '1 hour ago',
          read: false,
          type: 'system'
        },
        {
          id: 3,
          title: 'Pending Review',
          message: 'You have 3 applications to review',
          time: '2 hours ago',
          read: true,
          type: 'application'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    return segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title (hidden on mobile when search is open) */}
      <div className={cn("flex-1", showMobileSearch && "hidden sm:block")}>
        <h1 className="text-lg font-semibold sm:text-xl">{getPageTitle()}</h1>
      </div>

      {/* Desktop search */}
      <div className="hidden flex-1 max-w-md sm:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8"
          />
        </div>
      </div>

      {/* Mobile search button and overlay */}
      <div className="sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          {showMobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
      </div>

      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-16 bg-background border-b p-4 sm:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications - only render after mount to avoid hydration mismatch */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto text-xs"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start p-3 cursor-pointer",
                        !notification.read && "bg-muted/50"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          notification.type === 'application' ? 'bg-blue-500' :
                          notification.type === 'request' ? 'bg-green-500' : 'bg-purple-500'
                        )} />
                        <span className="font-medium flex-1">{notification.title}</span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Placeholder with same dimensions as the bell button to prevent layout shift
          <div className="h-10 w-10" />
        )}

        {/* User avatar (mobile only) */}
        <div className="lg:hidden">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.fullName?.[0] || user?.phoneNumber?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}