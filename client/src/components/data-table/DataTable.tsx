/**
 * Generic DataTable component
 * Supports sorting, searching, and pagination
 * Designed to be reusable across different entities
 * 
 * TODO Phase 2: Add row selection, bulk actions, advanced filters
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
import type { SortConfig } from '@/../../shared/types/entities';

export interface DataTableColumn<TData> {
  id: string;
  header: string;
  accessorKey?: keyof TData;
  cell?: (row: TData) => React.ReactNode;
  enableSorting?: boolean;
  enableSearch?: boolean;
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
  emptyStateTitle = 'Aucune donnée',
  emptyStateDescription = 'Aucun élément à afficher pour le moment.',
  emptyStateIcon,
}: DataTableProps<TData>) {
  const totalPages = Math.ceil(total / pageSize);

  // Loading skeleton
  if (loading && data.length === 0) {
    return (
      <div className="space-y-4">
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id}>{column.header}</TableHead>
                ))}
                {renderRowActions && <TableHead className="w-[80px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
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
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.enableSorting ? (
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
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
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
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                      ? String(row[column.accessorKey] ?? '-')
                      : '-'}
                  </TableCell>
                ))}
                {renderRowActions && (
                  <TableCell>{renderRowActions(row)}</TableCell>
                )}
              </TableRow>
            ))}
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

