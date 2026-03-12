"use client";

import React, { createContext, useContext, useState } from 'react';
import { FilterField } from '@/components/layout/FilterPanel';

interface DashboardContextType {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  filterFields: FilterField[];
  setFilterFields: (fields: FilterField[]) => void;
  filterValues: Record<string, any>;
  setFilterValue: (key: string, value: any) => void;
  clearFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = useState(true);
  const [filterFields, setFilterFields] = useState<FilterField[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const setFilterValue = (key: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilterValues({});
  };

  return (
    <DashboardContext.Provider
      value={{
        showSearch,
        setShowSearch,
        filterFields,
        setFilterFields,
        filterValues,
        setFilterValue,
        clearFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
}