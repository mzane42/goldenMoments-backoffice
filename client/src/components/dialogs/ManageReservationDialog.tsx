/**
 * Manage Reservation Dialog
 * Comprehensive dialog for managing reservation status, payment, and details
 */

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  User,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import type { ReservationStatus, ReservationPaymentStatus } from '@/../../shared/types/entities';
import { formatCurrency } from '@/lib/format';

interface ReservationFormData {
  status: ReservationStatus;
  paymentStatus: ReservationPaymentStatus;
  adminNotes: string;
  cancellationReason: string;
}

interface ManageReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: any; // ReservationWithRelations
  onSave: (data: Partial<ReservationFormData>) => Promise<void>;
  loading?: boolean;
  isPartner?: boolean; // Partners have restricted access
}

export function ManageReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSave,
  loading = false,
  isPartner = false,
}: ManageReservationDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ReservationFormData>({
    defaultValues: {
      status: reservation?.status || 'pending',
      paymentStatus: reservation?.paymentStatus || reservation?.payment_status || 'pending',
      adminNotes: reservation?.adminNotes || reservation?.admin_notes || '',
      cancellationReason: reservation?.cancellationReason || reservation?.cancellation_reason || '',
    },
  });

  const currentStatus = watch('status');
  const currentPaymentStatus = watch('paymentStatus');
  const isCancelled = currentStatus === 'cancelled';

  // Reset form when reservation changes
  React.useEffect(() => {
    if (reservation) {
      reset({
        status: reservation.status,
        paymentStatus: reservation.paymentStatus || reservation.payment_status || 'pending',
        adminNotes: reservation.adminNotes || reservation.admin_notes || '',
        cancellationReason: reservation.cancellationReason || reservation.cancellation_reason || '',
      });
    }
  }, [reservation, reset]);

  const handleFormSubmit = async (data: ReservationFormData) => {
    try {
      // Validate cancellation reason if status is cancelled
      if (data.status === 'cancelled' && !data.cancellationReason.trim()) {
        toast.error('Veuillez fournir une raison d\'annulation');
        return;
      }

      await onSave(data);
      toast.success('Réservation mise à jour avec succès');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const variants: Record<ReservationStatus, { variant: any; icon: React.ReactNode; label: string }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" />, label: 'En attente' },
      confirmed: { variant: 'default', icon: <CheckCircle className="h-3 w-3" />, label: 'Confirmée' },
      completed: { variant: 'default', icon: <CheckCircle className="h-3 w-3" />, label: 'Terminée' },
      cancelled: { variant: 'destructive', icon: <XCircle className="h-3 w-3" />, label: 'Annulée' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: ReservationPaymentStatus) => {
    const variants: Record<ReservationPaymentStatus, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'En attente' },
      paid: { variant: 'default', label: 'Payé' },
      failed: { variant: 'destructive', label: 'Échoué' },
      refunded: { variant: 'outline', label: 'Remboursé' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Extract guest details
  const guestDetails = (reservation as any)?.guest_details || reservation?.guestDetails || [];
  const primaryGuest = guestDetails[0];
  const priceBreakdown = (reservation as any)?.price_breakdown || reservation?.priceBreakdown;
  const selectedExtras = (reservation as any)?.selected_extras || reservation?.selectedExtras || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            Gérer la réservation
            <span className="font-mono text-lg text-muted-foreground">
              {reservation?.bookingReference || reservation?.booking_reference}
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {isPartner
              ? 'Consultez les détails de la réservation. Seuls les administrateurs peuvent modifier le statut.'
              : 'Modifiez le statut, les notes et les détails de paiement de cette réservation.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
          <ScrollArea className="flex-1 px-6">
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="status">Statut & Paiement</TabsTrigger>
                <TabsTrigger value="guest">Détails Client</TabsTrigger>
                <TabsTrigger value="pricing">Tarification</TabsTrigger>
                <TabsTrigger value="notes">Notes Admin</TabsTrigger>
              </TabsList>

              {/* ===== STATUS & PAYMENT TAB ===== */}
              <TabsContent value="status" className="space-y-6 pb-6">
                {/* Current Status Overview */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Statut actuel</Label>
                    <div>{getStatusBadge(reservation?.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Paiement actuel</Label>
                    <div>{getPaymentBadge(reservation?.paymentStatus || reservation?.payment_status)}</div>
                  </div>
                </div>

                <Separator />

                {/* Status Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Nouveau statut de réservation</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isPartner || loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                En attente
                              </div>
                            </SelectItem>
                            <SelectItem value="confirmed">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Confirmée
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Terminée
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Annulée
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sélectionnez le nouveau statut pour cette réservation
                    </p>
                  </div>

                  {/* Cancellation Reason (shown when cancelled) */}
                  {isCancelled && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2 mt-2">
                          <Label htmlFor="cancellationReason">Raison de l'annulation *</Label>
                          <Textarea
                            id="cancellationReason"
                            {...register('cancellationReason')}
                            placeholder="Ex: Changement de plan du client, problème de disponibilité, demande de remboursement..."
                            rows={3}
                            disabled={isPartner || loading}
                            className={errors.cancellationReason ? 'border-destructive' : ''}
                          />
                          {errors.cancellationReason && (
                            <p className="text-sm text-destructive">
                              {errors.cancellationReason.message}
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                {/* Payment Status */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Statut du paiement</Label>
                    <Controller
                      name="paymentStatus"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isPartner || loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                En attente
                              </div>
                            </SelectItem>
                            <SelectItem value="paid">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payé
                              </div>
                            </SelectItem>
                            <SelectItem value="failed">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Échoué
                              </div>
                            </SelectItem>
                            <SelectItem value="refunded">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Remboursé
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mettez à jour le statut du paiement une fois confirmé
                    </p>
                  </div>
                </div>

                {/* Quick Action Suggestions */}
                {!isPartner && (
                  <div className="space-y-2">
                    <Label className="text-sm">Actions rapides suggérées</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {reservation?.status === 'pending' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setValue('status', 'confirmed');
                            setValue('paymentStatus', 'paid');
                          }}
                          disabled={loading}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirmer & Marquer payé
                        </Button>
                      )}
                      {reservation?.status === 'confirmed' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setValue('status', 'completed')}
                          disabled={loading}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marquer terminée
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setValue('status', 'cancelled');
                        }}
                        disabled={loading}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Annuler la réservation
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ===== GUEST DETAILS TAB ===== */}
              <TabsContent value="guest" className="space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Informations client</h3>
                  </div>

                  {guestDetails.length > 0 ? (
                    <div className="space-y-4">
                      {guestDetails.map((guest: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border bg-muted/20 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {index === 0 ? 'Client principal' : `Invité ${index + 1}`}
                            </h4>
                            <Badge variant="outline">{guest.fullName}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-xs text-muted-foreground">Email</Label>
                              <p className="font-medium">{guest.email}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Téléphone</Label>
                              <p className="font-medium">{guest.phone}</p>
                            </div>
                          </div>

                          {guest.specialRequests && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Demandes spéciales
                              </Label>
                              <p className="text-sm mt-1 p-2 rounded bg-background">
                                {guest.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Aucune information détaillée sur les invités disponible.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Separator />

                  {/* Reservation Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Détails de la réservation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border bg-muted/20">
                        <Label className="text-xs text-muted-foreground">Nombre de personnes</Label>
                        <p className="text-lg font-semibold mt-1">
                          {(reservation as any)?.guest_count || reservation?.guestCount || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/20">
                        <Label className="text-xs text-muted-foreground">Nombre de chambres</Label>
                        <p className="text-lg font-semibold mt-1">
                          {(reservation as any)?.number_of_rooms || reservation?.numberOfRooms || 1}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/20">
                        <Label className="text-xs text-muted-foreground">Nombre de nuits</Label>
                        <p className="text-lg font-semibold mt-1">
                          {(reservation as any)?.number_of_nights || reservation?.numberOfNights || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/20">
                        <Label className="text-xs text-muted-foreground">Type de chambre</Label>
                        <p className="text-lg font-semibold mt-1">
                          {(reservation as any)?.roomTypeDetails?.name || 
                           (reservation as any)?.room_type || 
                           reservation?.roomType || 
                           '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ===== PRICING TAB ===== */}
              <TabsContent value="pricing" className="space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Détails de tarification</h3>
                  </div>

                  {/* Total Price */}
                  <div className="p-4 rounded-lg border-2 bg-primary/5 border-primary/20">
                    <Label className="text-xs text-muted-foreground">Montant total</Label>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {formatCurrency((reservation as any)?.total_price || reservation?.totalPrice || 0)}
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  {priceBreakdown && (
                    <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                      <h4 className="font-medium">Détail des prix</h4>
                      <div className="space-y-2 text-sm">
                        {priceBreakdown.pretaxRate !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prix HT</span>
                            <span className="font-medium">
                              {formatCurrency(priceBreakdown.pretaxRate)}
                            </span>
                          </div>
                        )}
                        {priceBreakdown.tax !== undefined && priceBreakdown.tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">TVA</span>
                            <span className="font-medium">
                              {formatCurrency(priceBreakdown.tax)}
                            </span>
                          </div>
                        )}
                        {priceBreakdown.discounts !== undefined && priceBreakdown.discounts > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Réductions</span>
                            <span className="font-medium">
                              -{formatCurrency(priceBreakdown.discounts)}
                            </span>
                          </div>
                        )}
                        {priceBreakdown.finalRate !== undefined && (
                          <>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Montant final</span>
                              <span>{formatCurrency(priceBreakdown.finalRate)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Extras */}
                  {selectedExtras.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Options supplémentaires sélectionnées</h4>
                      <div className="space-y-2">
                        {selectedExtras.map((extra: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                          >
                            <div className="flex items-center gap-2">
                              {extra.emoji && <span className="text-xl">{extra.emoji}</span>}
                              <span className="font-medium">{extra.label}</span>
                            </div>
                            <span className="font-semibold">
                              {formatCurrency(extra.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <Label className="text-xs text-muted-foreground">Méthode de paiement</Label>
                    <p className="font-medium mt-1">
                      {/* This would need to be added to the reservation data */}
                      Paiement à l'hôtel
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ===== NOTES TAB ===== */}
              <TabsContent value="notes" className="space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Notes administratives</h3>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Ces notes sont internes et ne sont pas visibles par le client. Utilisez-les pour
                      documenter les échanges, les arrangements spéciaux ou toute information pertinente.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Notes internes</Label>
                    <Textarea
                      id="adminNotes"
                      {...register('adminNotes')}
                      placeholder="Ajoutez des notes internes pour cette réservation..."
                      rows={10}
                      disabled={isPartner || loading}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ex: "Client a demandé une chambre à l'étage supérieur", "Préparation d'un gâteau
                      d'anniversaire", "Allergies: fruits de mer"
                    </p>
                  </div>

                  {/* Cancellation Info (if cancelled) */}
                  {reservation?.status === 'cancelled' && reservation?.cancellation_reason && (
                    <div className="space-y-2">
                      <Label className="text-destructive">Raison de l'annulation</Label>
                      <div className="p-4 rounded-lg border-2 border-destructive/20 bg-destructive/5">
                        <p className="text-sm">{reservation.cancellation_reason}</p>
                        {reservation.cancelled_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Annulée le{' '}
                            {new Date(reservation.cancelled_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            {!isPartner && (
              <Button type="submit" disabled={loading || !isDirty}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour en cours...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

