"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Search, Filter, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onFilterToggle?: () => void;
  filterActive?: boolean;
}

export function Header({ showSearch = true, onSearch, onFilterToggle, filterActive = false }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    return segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">KACOPO-IMS</span>
          </Link>
          <span className="hidden text-sm font-medium text-muted-foreground lg:inline-block">
            {getPageTitle()}
          </span>
        </div>

        {/* Center: search (conditionally shown) */}
        {showSearch && (
          <div className="hidden flex-1 max-w-md mx-4 lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch?.(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {onFilterToggle && (
            <Button
              variant={filterActive ? "default" : "outline"}
              size="sm"
              onClick={onFilterToggle}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filterActive && <Badge variant="secondary" className="ml-2 h-5 w-5 p-0">•</Badge>}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0"></Badge>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback></AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="lg:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch?.(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
      )}
    </header>
  );
}