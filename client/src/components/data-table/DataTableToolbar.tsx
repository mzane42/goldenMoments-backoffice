/**
 * DataTable Toolbar - Simple search only
 * 
 * TODO Phase 2: Add advanced filters, batch action buttons
 */

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {/* TODO Phase 2: Add filter buttons, export button, etc. */}
    </div>
  );
}

