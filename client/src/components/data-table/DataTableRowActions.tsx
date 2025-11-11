/**
 * DataTable Row Actions component
 * Provides per-row dropdown menu with View, Edit, Delete actions
 */

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

interface DataTableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  additionalActions?: RowAction[];
}

export function DataTableRowActions({
  onView,
  onEdit,
  onDelete,
  additionalActions = [],
}: DataTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-8 w-8" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            Voir détails
          </DropdownMenuItem>
        )} */}
        
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier les informations
          </DropdownMenuItem>
        )}

        {additionalActions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.variant === 'destructive' ? 'text-destructive' : ''}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            {/* make it red */}
            <DropdownMenuItem onClick={onDelete} className="text-destructive text-red-600 ">
              <Trash2 className="mr-2 h-4 w-4 text-red-700" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

