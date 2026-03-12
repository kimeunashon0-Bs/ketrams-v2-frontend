"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
}

interface FilterPanelProps {
  filters: FilterField[];
  onFilterChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
}

export function FilterPanel({ filters, onFilterChange, onClear, className }: FilterPanelProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
    onFilterChange(key, value);
  };

  return (
    <div className={cn("border-t bg-background p-4", className)}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Filters</h3>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1">
              <Label htmlFor={filter.key}>{filter.label}</Label>
              {filter.type === 'select' ? (
                <select
                  id={filter.key}
                  value={values[filter.key] || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(filter.key, e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={filter.key}
                  type={filter.type}
                  value={values[filter.key] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(filter.key, e.target.value)}
                  placeholder={`Filter by ${filter.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}