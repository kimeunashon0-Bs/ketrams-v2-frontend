"use client";

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { DashboardProvider } from '@/contexts/DashboardContext'; // <-- Add this
import { cn } from '@/lib/utils';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <DashboardHeader />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardProvider> 
        <DashboardContent>{children}</DashboardContent>
      </DashboardProvider>
    </SidebarProvider>
  );
}