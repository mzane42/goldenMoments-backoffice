/**
 * Generic DataTable component
 * Supports sorting, searching, pagination, and batch selection
 * Designed to be reusable across different entities
 */

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import { createSelectionColumn } from './columns/selection-column';
import type { SortConfig } from '@/../../shared/types/entities';
import { cn } from '@/lib/utils';

export interface DataTableColumn<TData> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof TData;
  cell?: (row: TData) => React.ReactNode;
  enableSorting?: boolean;
  enableSearch?: boolean;
  size?: number;
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  // Sorting
  sortConfig: SortConfig | null;
  onSortChange: (config: SortConfig | null) => void;
  // Row actions
  renderRowActions?: (row: TData) => React.ReactNode;
  // Row selection
  enableRowSelection?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  maxSelection?: number;
  renderBatchActions?: (selectedCount: number) => React.ReactNode;
  // Empty state
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: React.ReactNode;
}

export function DataTable<TData extends { id: string }>({
  columns,
  data,
  loading = false,
  error = null,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  sortConfig,
  onSortChange,
  renderRowActions,
  enableRowSelection = false,
  selectedRows = [],
  onSelectionChange = () => {},
  maxSelection = 20,
  renderBatchActions,
  emptyStateTitle = 'Aucune donnée',
  emptyStateDescription = 'Aucun élément à afficher pour le moment.',
  emptyStateIcon,
}: DataTableProps<TData>) {
  // Normalize pageSize to prevent division by zero
  const normalizedPageSize = Math.max(1, Number(pageSize) || 1);
  const totalPages = total > 0 ? Math.ceil(total / normalizedPageSize) : 0;

  // Create selection column if needed
  const selectionColumn = enableRowSelection ? createSelectionColumn<TData>() : null;
  const allColumns = selectionColumn ? [selectionColumn, ...columns] : columns;

  // Loading skeleton
  if (loading && data.length === 0) {
    return (
      <div className="space-y-4">
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          batchActions={renderBatchActions && selectedRows.length > 0 ? renderBatchActions(selectedRows.length) : null}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {allColumns.map((column) => (
                  <TableHead key={column.id} style={column.size ? { width: column.size } : undefined}>
                    {typeof column.header === 'string' ? column.header : column.header}
                  </TableHead>
                ))}
                {renderRowActions && <TableHead className="w-[80px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: normalizedPageSize }).map((_, index) => (
                <TableRow key={index}>
                  {allColumns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          batchActions={renderBatchActions && selectedRows.length > 0 ? renderBatchActions(selectedRows.length) : null}
        />
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && !loading) {
    return (
      <div className="space-y-4">
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          batchActions={renderBatchActions && selectedRows.length > 0 ? renderBatchActions(selectedRows.length) : null}
        />
        <div className="rounded-md border">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            {emptyStateIcon && (
              <div className="mb-4 text-muted-foreground opacity-50">
                {emptyStateIcon}
              </div>
            )}
            <h3 className="text-lg font-semibold">{emptyStateTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {emptyStateDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        batchActions={renderBatchActions && selectedRows.length > 0 ? renderBatchActions(selectedRows.length) : null}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {allColumns.map((column) => (
                <TableHead key={column.id} style={column.size ? { width: column.size } : undefined}>
                  {/* Render selection header */}
                  {column.id === 'select' && selectionColumn ? (
                    selectionColumn.header({
                      data,
                      selectedIds: selectedRows,
                      onSelectionChange,
                      maxSelection,
                    })
                  ) : /* Render sortable header */
                  column.enableSorting && 'accessorKey' in column ? (
                    <button
                      className="flex items-center gap-2 hover:text-foreground"
                      onClick={() => {
                        if (!column.accessorKey) return;
                        const newDirection =
                          sortConfig?.column === column.accessorKey &&
                          sortConfig?.direction === 'asc'
                            ? 'desc'
                            : 'asc';
                        onSortChange({
                          column: column.accessorKey as string,
                          direction: newDirection,
                        });
                      }}
                    >
                      {column.header}
                      {sortConfig?.column === column.accessorKey && (
                        <span className="text-xs">
                          {sortConfig?.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {renderRowActions && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const isSelected = selectedRows.includes(row.id);
              return (
                <TableRow
                  key={row.id}
                  className={cn(isSelected && 'bg-muted/50')}
                >
                  {allColumns.map((column) => (
                    <TableCell key={column.id}>
                      {/* Render selection cell */}
                      {column.id === 'select' && selectionColumn ? (
                        selectionColumn.cell({
                          row,
                          selectedIds: selectedRows,
                          onSelectionChange,
                          maxSelection,
                        })
                      ) : column.cell ? (
                        column.cell(row)
                      ) : 'accessorKey' in column && column.accessorKey ? (
                        String(row[column.accessorKey] ?? '-')
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell>{renderRowActions(row)}</TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

