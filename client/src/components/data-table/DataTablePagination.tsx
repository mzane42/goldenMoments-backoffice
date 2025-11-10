/**
 * DataTable Pagination component
 * Provides page navigation and page size selection
 */

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Lignes par page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageChange(1); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          {total > 0
            ? `${startItem}-${endItem} sur ${total}`
            : '0 résultat'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="hidden h-8 w-8 p-0 lg:flex"
        >
          <span className="sr-only">Aller à la première page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Page précédente</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 text-sm font-medium">
          Page {page} sur {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Page suivante</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="hidden h-8 w-8 p-0 lg:flex"
        >
          <span className="sr-only">Aller à la dernière page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

