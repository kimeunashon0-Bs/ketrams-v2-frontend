"use client";

import { Header } from './Header';
import { FilterPanel } from './FilterPanel';
import { useDashboard } from '@/contexts/DashboardContext';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { showSearch, filterFields, filterValues, setFilterValue, clearFilters } = useDashboard();
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
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
  );
}