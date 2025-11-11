/**
 * DataTable Batch Actions Toolbar
 * Displays action buttons when rows are selected
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface BatchAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface DataTableBatchActionsProps {
  selectedCount: number;
  maxSelection?: number;
  actions: BatchAction[];
  onClearSelection: () => void;
}

export function DataTableBatchActions({
  selectedCount,
  maxSelection = 20,
  actions,
  onClearSelection,
}: DataTableBatchActionsProps) {
  const isAtMax = selectedCount >= maxSelection;

  return (
    <div className="flex items-center gap-3 py-2 px-4 bg-muted/50 rounded-md border">
      {/* Selection count badge */}
      <div className="flex items-center gap-2">
        <Badge variant={isAtMax ? 'destructive' : 'default'} className="font-semibold">
          {selectedCount} / {maxSelection}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {selectedCount === 1 ? 'élément sélectionné' : 'éléments sélectionnés'}
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="h-8"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Clear selection button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-8"
      >
        <X className="h-4 w-4 mr-1" />
        Effacer
      </Button>
    </div>
  );
}
