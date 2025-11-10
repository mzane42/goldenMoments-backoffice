/**
 * useTableState hook
 * Manages search, sort, and pagination state for DataTable
 * 
 * TODO Phase 2: Add filter state management
 */

import { useState, useCallback, useEffect } from 'react';
import { usePersistFn } from './usePersistFn';
import type { SortConfig } from '@/../../shared/types/entities';

interface UseTableStateOptions {
  initialPageSize?: number;
  searchDebounceMs?: number;
}

interface TableState {
  // Search
  searchValue: string;
  debouncedSearchValue: string;
  setSearchValue: (value: string) => void;
  
  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // Sorting
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  
  // Reset
  resetState: () => void;
}

export function useTableState({
  initialPageSize = 20,
  searchDebounceMs = 300,
}: UseTableStateOptions = {}): TableState {
  // Search state
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      // Reset to first page when search changes
      setPage(1);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, searchDebounceMs]);

  // Reset to first page when page size changes
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  // Reset all state
  const resetState = usePersistFn(() => {
    setSearchValue('');
    setDebouncedSearchValue('');
    setPage(1);
    setPageSize(initialPageSize);
    setSortConfig(null);
  });

  return {
    searchValue,
    debouncedSearchValue,
    setSearchValue,
    page,
    pageSize,
    setPage,
    setPageSize: handlePageSizeChange,
    sortConfig,
    setSortConfig,
    resetState,
  };
}

