/**
 * Edit Admin Notes Dialog Component
 * Allows admins to add or edit notes on a reservation
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EditAdminNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNotes: string | null;
  bookingReference?: string;
  onSave: (notes: string) => Promise<void>;
  loading?: boolean;
}

export function EditAdminNotesDialog({
  open,
  onOpenChange,
  currentNotes,
  bookingReference,
  onSave,
  loading = false,
}: EditAdminNotesDialogProps) {
  const [notes, setNotes] = React.useState(currentNotes || '');
  const [error, setError] = React.useState('');

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setNotes(currentNotes || '');
      setError('');
    }
  }, [open, currentNotes]);

  const handleSave = async () => {
    try {
      setError('');
      await onSave(notes.trim());
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const hasChanges = notes.trim() !== (currentNotes || '').trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notes administrateur</DialogTitle>
          <DialogDescription>
            {bookingReference && `Réservation: ${bookingReference}`}
            <br />
            Ajoutez ou modifiez des notes internes pour cette réservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Notes Textarea */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes internes sur cette réservation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Ces notes sont visibles uniquement par l'équipe administrative.
            </p>
          </div>

          {/* Character count */}
          <div className="text-xs text-muted-foreground text-right">
            {notes.length} caractères
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

