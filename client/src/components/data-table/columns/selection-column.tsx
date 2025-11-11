/**
 * Selection Column for DataTable
 * Provides checkbox column for batch row selection with configurable max limit
 */

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export interface SelectionColumnProps<TData extends { id: string }> {
  data: TData[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection?: number;
}

/**
 * Creates header and cell components for selection column
 */
export function createSelectionColumn<TData extends { id: string }>() {
  const SelectionHeader = ({
    data,
    selectedIds,
    onSelectionChange,
    maxSelection = 20,
  }: SelectionColumnProps<TData>) => {
      const pageIds = data.map((row) => row.id);
      const selectedPageIds = pageIds.filter((id) => selectedIds.includes(id));
      const isAllSelected = pageIds.length > 0 && selectedPageIds.length === pageIds.length;
      const isIndeterminate = selectedPageIds.length > 0 && selectedPageIds.length < pageIds.length;

      const handleSelectAll = () => {
        if (isAllSelected) {
          // Deselect all on current page
          onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
        } else {
          // Select all on current page (respecting max limit)
          const remainingSlots = maxSelection - selectedIds.length;
          const idsToAdd = pageIds.filter((id) => !selectedIds.includes(id)).slice(0, remainingSlots);
          onSelectionChange([...selectedIds, ...idsToAdd]);
        }
      };

    return (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={isAllSelected}
          aria-label="Select all on page"
          onCheckedChange={handleSelectAll}
          className={isIndeterminate ? 'data-[state=checked]:bg-primary/50' : ''}
        />
      </div>
    );
  };

  const SelectionCell = ({
    row,
    selectedIds,
    onSelectionChange,
    maxSelection = 20,
  }: {
    row: TData;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    maxSelection?: number;
  }) => {
      const isSelected = selectedIds.includes(row.id);
      const isDisabled = !isSelected && selectedIds.length >= maxSelection;

      const handleSelect = () => {
        if (isSelected) {
          onSelectionChange(selectedIds.filter((id) => id !== row.id));
        } else if (!isDisabled) {
          onSelectionChange([...selectedIds, row.id]);
        }
      };

    return (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={isSelected}
          disabled={isDisabled}
          aria-label={`Select row ${row.id}`}
          onCheckedChange={handleSelect}
        />
      </div>
    );
  };

  return {
    id: 'select',
    header: SelectionHeader as any,
    cell: SelectionCell as any,
    enableSorting: false,
    size: 40,
  };
}
