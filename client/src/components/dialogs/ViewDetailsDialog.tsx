/**
 * ViewDetailsDialog - Generic read-only view dialog
 * Displays entity details in a formatted dialog
 * 
 * TODO Phase 2: Add more detailed views with tabs, related data
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface DetailSection {
  title?: string;
  fields: DetailField[];
}

interface ViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  sections: DetailSection[];
}

export function ViewDetailsDialog({
  open,
  onOpenChange,
  title,
  description,
  sections,
}: ViewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <>
                    <h3 className="font-semibold text-sm mb-3">
                      {section.title}
                    </h3>
                    {sectionIndex > 0 && <Separator className="mb-4" />}
                  </>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      className={field.fullWidth ? 'md:col-span-2' : ''}
                    >
                      <dt className="text-sm font-medium text-muted-foreground mb-1">
                        {field.label}
                      </dt>
                      <dd className="text-sm text-foreground">
                        {field.value || '-'}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

