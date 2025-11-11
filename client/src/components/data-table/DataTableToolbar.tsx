/**
 * DataTable Toolbar - Search and batch actions
 */

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  batchActions?: React.ReactNode | null;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  batchActions,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {batchActions && <div className="flex items-center gap-2">{batchActions}</div>}
    </div>
  );
}

