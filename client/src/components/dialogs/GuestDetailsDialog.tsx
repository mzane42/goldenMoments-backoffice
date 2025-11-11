/**
 * Guest Details Dialog Component
 * Displays detailed information about all guests in a reservation
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, User, MessageSquare } from 'lucide-react';
import type { GuestDetail } from '@/../../shared/types/entities';

interface GuestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: GuestDetail[];
  bookingReference?: string;
}

export function GuestDetailsDialog({
  open,
  onOpenChange,
  guests,
  bookingReference,
}: GuestDetailsDialogProps) {
  if (!guests || guests.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails des invités</DialogTitle>
            <DialogDescription>
              {bookingReference && `Réservation: ${bookingReference}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            Aucune information sur les invités disponible.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails des invités</DialogTitle>
          <DialogDescription>
            {bookingReference && `Réservation: ${bookingReference}`}
            <br />
            {guests.length} invité{guests.length > 1 ? 's' : ''} enregistré{guests.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {guests.map((guest, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Invité {index + 1}
                  {index === 0 && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      (Contact principal)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Full Name */}
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nom complet</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.fullName || '-'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.email || '-'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.phone || '-'}
                    </p>
                  </div>
                </div>

                {/* Special Requests */}
                {guest.specialRequests && guest.specialRequests.trim() && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Demandes spéciales</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.specialRequests}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

