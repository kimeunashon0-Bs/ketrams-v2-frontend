"use client";

import { Header } from './Header';
import { FilterPanel } from './FilterPanel';
import { DashboardSidebar } from './DashboardSidebar'; // <-- import the sidebar
import { useSidebar } from '@/contexts/SidebarContext'; // <-- import sidebar context
import { useDashboard } from '@/contexts/DashboardContext';
import { useState } from 'react';
import { cn } from '@/lib/utils'; // make sure you have the cn utility

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { showSearch, filterFields, filterValues, setFilterValue, clearFilters } = useDashboard();
  const { isCollapsed } = useSidebar(); // get collapse state
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed sidebar – always rendered */}
      <DashboardSidebar />

      {/* Main content area – shifted on desktop based on sidebar state */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:ml-64", // default expanded width
          isCollapsed && "lg:ml-20" // collapsed width
        )}
      >
        <Header
          showSearch={showSearch}
          onFilterToggle={() => setFilterOpen(!filterOpen)}
          filterActive={filterOpen && filterFields.length > 0}
        />

        {filterOpen && filterFields.length > 0 && (
          <FilterPanel
            filters={filterFields}
            onFilterChange={setFilterValue}
            onClear={clearFilters}
          />
        )}

        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}