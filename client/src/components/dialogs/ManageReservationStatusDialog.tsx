/**
 * Manage Reservation Status Dialog Component
 * Allows admins to update reservation status and cancel with reason
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { ReservationStatus } from '@/../../shared/types/entities';

interface ManageReservationStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: ReservationStatus;
  bookingReference?: string;
  onConfirm: (status: ReservationStatus, reason?: string) => Promise<void>;
  loading?: boolean;
}

export function ManageReservationStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  bookingReference,
  onConfirm,
  loading = false,
}: ManageReservationStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<ReservationStatus>(currentStatus);
  const [cancellationReason, setCancellationReason] = React.useState('');
  const [error, setError] = React.useState('');

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setCancellationReason('');
      setError('');
    }
  }, [open, currentStatus]);

  const handleConfirm = async () => {
    // Validate cancellation reason if status is cancelled
    if (selectedStatus === 'cancelled' && !cancellationReason.trim()) {
      setError('Une raison d\'annulation est requise');
      return;
    }

    try {
      setError('');
      await onConfirm(
        selectedStatus,
        selectedStatus === 'cancelled' ? cancellationReason : undefined
      );
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const statusLabels: Record<ReservationStatus, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    cancelled: 'Annulée',
    completed: 'Terminée',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le statut</DialogTitle>
          <DialogDescription>
            {bookingReference && `Réservation: ${bookingReference}`}
            <br />
            Statut actuel: <strong>{statusLabels[currentStatus]}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Selector */}
          <div className="space-y-2">
            <Label htmlFor="status">Nouveau statut</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ReservationStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cancellation Reason (only shown if cancelled) */}
          {selectedStatus === 'cancelled' && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison de l'annulation <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Expliquez la raison de l'annulation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Cette raison sera visible par l'utilisateur et l'équipe.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning for status changes */}
          {selectedStatus !== currentStatus && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedStatus === 'cancelled'
                  ? 'L\'annulation de cette réservation peut déclencher des notifications et des remboursements.'
                  : `Êtes-vous sûr de vouloir changer le statut de "${statusLabels[currentStatus]}" à "${statusLabels[selectedStatus]}" ?`}
              </AlertDescription>
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
            onClick={handleConfirm}
            disabled={loading || selectedStatus === currentStatus}
          >
            {loading ? 'Enregistrement...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

