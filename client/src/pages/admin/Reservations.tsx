/**
 * Admin Reservations Page
 * CRUD interface for managing all reservations
 */

import * as React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { reservationsColumns } from '@/components/data-table/columns/reservations-columns';
import { ViewDetailsDialog, type DetailSection } from '@/components/dialogs/ViewDetailsDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { GuestDetailsDialog } from '@/components/dialogs/GuestDetailsDialog';
import { ManageReservationDialog } from '@/components/dialogs/ManageReservationDialog';
import { ReservationStats } from '@/components/reservations/ReservationStats';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Plus, Calendar, Download, Users, FileEdit, GitBranch, CheckCircle, XCircle, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ReservationWithRelations, ReservationStatus } from '@/../../shared/types/entities';
import { DataTableBatchActions, type BatchAction } from '@/components/data-table/DataTableBatchActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getReservationStatusBadge,
  getPaymentStatusBadge,
} from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { exportReservationsToCSV } from '@/lib/export';

export default function AdminReservations() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedReservation, setSelectedReservation] = React.useState<ReservationWithRelations | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingReservation, setDeletingReservation] = React.useState<ReservationWithRelations | null>(null);
  
  // Guest details dialog state
  const [guestDialogOpen, setGuestDialogOpen] = React.useState(false);
  const [guestDialogReservation, setGuestDialogReservation] = React.useState<ReservationWithRelations | null>(null);
  
  // Manage reservation dialog state (comprehensive)
  const [manageDialogOpen, setManageDialogOpen] = React.useState(false);
  const [manageDialogReservation, setManageDialogReservation] = React.useState<ReservationWithRelations | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Batch action dialogs
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = React.useState(false);
  const [batchCancelDialogOpen, setBatchCancelDialogOpen] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState('');

  // Fetch reservations
  const { data, isLoading, error, refetch } = trpc.admin.reservations.list.useQuery({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.debouncedSearchValue,
    sortColumn: tableState.sortConfig?.column,
    sortDirection: tableState.sortConfig?.direction,
  });

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = trpc.admin.reservations.stats.useQuery();

  // Delete mutation
  const deleteMutation = trpc.admin.reservations.delete.useMutation({
    onSuccess: () => {
      toast.success('Réservation supprimée avec succès');
      setDeleteDialogOpen(false);
      setDeletingReservation(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Comprehensive reservation update mutation
  const updateReservationMutation = trpc.admin.reservations.updateReservation.useMutation({
    onSuccess: () => {
      setManageDialogOpen(false);
      setManageDialogReservation(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Batch mutations
  const batchUpdateStatusMutation = trpc.admin.reservations.batchUpdateStatus.useMutation({
    onSuccess: (result) => {
      if (result.failed === 0) {
        toast.success(`${result.success} réservation(s) mise(s) à jour avec succès`);
      } else {
        toast.warning(`${result.success} réussie(s), ${result.failed} échouée(s)`);
      }
      setSelectedIds([]);
      setBatchCancelDialogOpen(false);
      setCancellationReason('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const batchDeleteMutation = trpc.admin.reservations.batchDelete.useMutation({
    onSuccess: (result) => {
      if (result.failed === 0) {
        toast.success(`${result.success} réservation(s) supprimée(s) avec succès`);
      } else {
        toast.warning(`${result.success} supprimée(s), ${result.failed} échouée(s)`);
      }
      setSelectedIds([]);
      setBatchDeleteDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleView = (reservation: ReservationWithRelations) => {
    setSelectedReservation(reservation);
    setViewDialogOpen(true);
  };

  const handleEdit = (reservation: ReservationWithRelations) => {
    // TODO Phase 2: Implement edit dialog
    toast.info('Modification à implémenter');
  };

  const handleDelete = (reservation: ReservationWithRelations) => {
    setDeletingReservation(reservation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingReservation) return;
    await deleteMutation.mutateAsync({ id: deletingReservation.id });
  };

  const handleViewGuests = (reservation: ReservationWithRelations) => {
    // Ensure we're using the correct field name from database (snake_case)
    const reservationWithGuests = {
      ...reservation,
      guestDetails: (reservation as any).guest_details || reservation.guestDetails || [],
    };
    setGuestDialogReservation(reservationWithGuests);
    setGuestDialogOpen(true);
  };

  const handleManageReservation = (reservation: ReservationWithRelations) => {
    setManageDialogReservation(reservation);
    setManageDialogOpen(true);
  };

  const handleSaveReservation = async (data: any) => {
    if (!manageDialogReservation) return;
    await updateReservationMutation.mutateAsync({
      id: manageDialogReservation.id,
      status: data.status,
      paymentStatus: data.paymentStatus,
      adminNotes: data.adminNotes,
      cancellationReason: data.cancellationReason,
    });
  };

  // Quick action handlers
  const handleQuickConfirm = async (reservation: ReservationWithRelations) => {
    if (confirm('Confirmer cette réservation et marquer comme payée ?')) {
      await updateReservationMutation.mutateAsync({
        id: reservation.id,
        status: 'confirmed',
        paymentStatus: 'paid',
      });
      toast.success('Réservation confirmée et marquée comme payée');
    }
  };

  const handleQuickComplete = async (reservation: ReservationWithRelations) => {
    if (confirm('Marquer cette réservation comme terminée ?')) {
      await updateReservationMutation.mutateAsync({
        id: reservation.id,
        status: 'completed',
      });
      toast.success('Réservation marquée comme terminée');
    }
  };

  const handleQuickCancel = (reservation: ReservationWithRelations) => {
    // Open manage dialog directly to cancellation
    setManageDialogReservation(reservation);
    setManageDialogOpen(true);
  };

  // Batch action handlers
  const handleBatchConfirm = async () => {
    await batchUpdateStatusMutation.mutateAsync({
      ids: selectedIds,
      status: 'confirmed',
      paymentStatus: 'paid',
    });
  };

  const handleBatchComplete = async () => {
    await batchUpdateStatusMutation.mutateAsync({
      ids: selectedIds,
      status: 'completed',
    });
  };

  const handleBatchCancel = () => {
    setBatchCancelDialogOpen(true);
  };

  const handleConfirmBatchCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Veuillez fournir une raison d\'annulation');
      return;
    }
    await batchUpdateStatusMutation.mutateAsync({
      ids: selectedIds,
      status: 'cancelled',
      cancellationReason,
    });
  };

  const handleBatchUpdatePayment = async (paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded') => {
    await batchUpdateStatusMutation.mutateAsync({
      ids: selectedIds,
      paymentStatus,
    });
  };

  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true);
  };

  const confirmBatchDelete = async () => {
    await batchDeleteMutation.mutateAsync({ ids: selectedIds });
  };

  const handleExportCSV = () => {
    if (data?.data) {
      exportReservationsToCSV(data.data);
      toast.success('Export CSV réussi');
    }
  };

  // Prepare batch actions
  const renderBatchActions = (selectedCount: number) => {
    const actions: BatchAction[] = [
      {
        label: 'Confirmer',
        icon: <CheckCircle className="mr-1 h-4 w-4" />,
        onClick: handleBatchConfirm,
        variant: 'default',
      },
      {
        label: 'Terminer',
        icon: <CheckCircle className="mr-1 h-4 w-4" />,
        onClick: handleBatchComplete,
        variant: 'secondary',
      },
      {
        label: 'Annuler',
        icon: <XCircle className="mr-1 h-4 w-4" />,
        onClick: handleBatchCancel,
        variant: 'outline',
      },
      {
        label: 'Supprimer',
        icon: <Trash2 className="mr-1 h-4 w-4" />,
        onClick: handleBatchDelete,
        variant: 'destructive',
      },
    ];

    return (
      <DataTableBatchActions
        selectedCount={selectedCount}
        maxSelection={20}
        actions={actions}
        onClearSelection={() => setSelectedIds([])}
      />
    );
  };

  // Prepare view details sections
  const viewSections: DetailSection[] = selectedReservation
    ? [
        {
          title: 'Informations générales',
          fields: [
            { label: 'Référence', value: selectedReservation.bookingReference },
            { label: 'Statut', value: <Badge variant={getReservationStatusBadge(selectedReservation.status).variant}>{getReservationStatusBadge(selectedReservation.status).label}</Badge> },
            { label: 'Paiement', value: <Badge variant={getPaymentStatusBadge(selectedReservation.paymentStatus).variant}>{getPaymentStatusBadge(selectedReservation.paymentStatus).label}</Badge> },
            { label: 'Montant total', value: formatCurrency(selectedReservation.totalPrice) },
          ],
        },
        {
          title: 'Invités',
          fields: (() => {
            const guestDetails = (selectedReservation as any).guest_details || selectedReservation.guestDetails;
            return guestDetails && guestDetails.length > 0
            ? guestDetails.flatMap((guest: any, index: number) => [
                { label: `Invité ${index + 1} - Nom`, value: guest.fullName },
                { label: `Invité ${index + 1} - Email`, value: guest.email },
                { label: `Invité ${index + 1} - Téléphone`, value: guest.phone },
                ...(guest.specialRequests ? [{ label: `Invité ${index + 1} - Demandes`, value: guest.specialRequests, fullWidth: true }] : []),
              ])
            : [
                { label: 'Nom', value: selectedReservation.user?.fullName || '-' },
                { label: 'Email', value: selectedReservation.user?.email || '-' },
                { label: 'Téléphone', value: selectedReservation.user?.phoneNumber || '-' },
              ];
          })(),
        },
        {
          title: 'Détails du séjour',
          fields: [
            { label: 'Expérience', value: selectedReservation.experience?.title || 'Expérience supprimée', fullWidth: true },
            { label: "Date d'arrivée", value: formatDate(selectedReservation.checkInDate) },
            { label: 'Date de départ', value: formatDate(selectedReservation.checkOutDate) },
            { label: 'Nuits', value: (selectedReservation as any).number_of_nights || selectedReservation.numberOfNights || '-' },
            { label: 'Type de chambre', value: (selectedReservation as any).roomTypeDetails?.name || selectedReservation.roomType || '-' },
            { label: 'Nombre de personnes', value: selectedReservation.guestCount },
            { label: 'Nombre de chambres', value: (selectedReservation as any).number_of_rooms || selectedReservation.numberOfRooms || 1 },
          ],
        },
        ...((selectedReservation as any).price_breakdown || selectedReservation.priceBreakdown ? [{
          title: 'Détails du prix',
          fields: (() => {
            const priceBreakdown = (selectedReservation as any).price_breakdown || selectedReservation.priceBreakdown;
            return [
              { label: 'Tarif de base', value: formatCurrency(priceBreakdown.pretaxRate || priceBreakdown.subtotal || 0) },
              ...(priceBreakdown.discounts ? [{ label: 'Réductions', value: formatCurrency(priceBreakdown.discounts) }] : []),
              ...(priceBreakdown.tax ? [{ label: 'Taxes', value: formatCurrency(priceBreakdown.tax) }] : []),
              { label: 'Total', value: formatCurrency(priceBreakdown.finalRate || priceBreakdown.total || selectedReservation.totalPrice) },
            ];
          })(),
        }] : []),
        ...(() => {
          const selectedExtras = (selectedReservation as any).selected_extras || selectedReservation.selectedExtras;
          return selectedExtras && selectedExtras.length > 0 ? [{
          title: 'Extras sélectionnés',
          fields: selectedExtras.map((extra: any) => ({
            label: extra.label,
            value: `${formatCurrency(extra.price)} × ${extra.quantity}`,
          })),
        }] : [];
        })(),
        {
          title: 'Informations système',
          fields: [
            { label: 'Créé le', value: formatDateTime(selectedReservation.createdAt) },
            { label: 'Modifié le', value: formatDateTime(selectedReservation.updatedAt) },
            { label: 'Notes admin', value: selectedReservation.adminNotes || '-', fullWidth: true },
          ],
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Réservations</h1>
            <p className="text-muted-foreground mt-1">
              Gérez toutes les réservations de la plateforme
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={!data?.data || data.data.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
            {/* <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle réservation
            </Button> */}
          </div>
        </div>

        {/* Statistics */}
        {statsData && (
          <ReservationStats stats={statsData} loading={statsLoading} />
        )}

        {/* DataTable */}
        <DataTable
          columns={reservationsColumns}
          data={data?.data || []}
          loading={isLoading}
          error={error?.message}
          page={tableState.page}
          pageSize={tableState.pageSize}
          total={data?.total || 0}
          onPageChange={tableState.setPage}
          onPageSizeChange={tableState.setPageSize}
          searchValue={tableState.searchValue}
          onSearchChange={tableState.setSearchValue}
          searchPlaceholder="Rechercher par référence, client, expérience..."
          sortConfig={tableState.sortConfig}
          onSortChange={tableState.setSortConfig}
          enableRowSelection={true}
          selectedRows={selectedIds}
          onSelectionChange={setSelectedIds}
          maxSelection={20}
          renderBatchActions={renderBatchActions}
          renderRowActions={(row) => {
            const isPending = row.status === 'pending';
            const isConfirmed = row.status === 'confirmed';
            const quickActions = [];
            
            // Add quick action buttons based on status
            if (isPending) {
              quickActions.push({
                label: 'Confirmer & Marquer payé',
                icon: <CheckCircle className="mr-2 h-4 w-4" />,
                onClick: () => handleQuickConfirm(row),
              });
            }
            
            if (isConfirmed) {
              quickActions.push({
                label: 'Marquer terminée',
                icon: <CheckCircle className="mr-2 h-4 w-4" />,
                onClick: () => handleQuickComplete(row),
              });
            }
            
            if (row.status !== 'cancelled') {
              quickActions.push({
                label: 'Annuler',
                icon: <XCircle className="mr-2 h-4 w-4" />,
                onClick: () => handleQuickCancel(row),
              });
            }
            
            return (
              <DataTableRowActions
                onView={() => handleView(row)}
                onEdit={() => handleManageReservation(row)}
                onDelete={() => handleDelete(row)}
                additionalActions={[
                  {
                    label: 'Gérer la réservation',
                    icon: <Settings className="mr-2 h-4 w-4" />,
                    onClick: () => handleManageReservation(row),
                  },
                  {
                    label: 'Voir les invités',
                    icon: <Users className="mr-2 h-4 w-4" />,
                    onClick: () => handleViewGuests(row),
                  },
                  ...quickActions,
                ]}
              />
            );
          }}
          emptyStateTitle="Aucune réservation"
          emptyStateDescription="Aucune réservation trouvée. Créez-en une nouvelle pour commencer."
          emptyStateIcon={<Calendar className="h-12 w-12" />}
        />

        {/* View Dialog */}
        <ViewDetailsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          title="Détails de la réservation"
          description={selectedReservation?.bookingReference}
          sections={viewSections}
        />

        {/* Guest Details Dialog */}
        <GuestDetailsDialog
          open={guestDialogOpen}
          onOpenChange={setGuestDialogOpen}
          guests={(guestDialogReservation as any)?.guest_details || guestDialogReservation?.guestDetails || []}
          bookingReference={guestDialogReservation?.bookingReference}
        />

        {/* Comprehensive Manage Reservation Dialog */}
        {manageDialogReservation && (
          <ManageReservationDialog
            open={manageDialogOpen}
            onOpenChange={setManageDialogOpen}
            reservation={manageDialogReservation}
            onSave={handleSaveReservation}
            loading={updateReservationMutation.isPending}
            isPartner={false}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Supprimer cette réservation ?"
          itemName={deletingReservation?.bookingReference}
          loading={deleteMutation.isPending}
        />

        {/* Batch Delete Dialog */}
        <AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer {selectedIds.length} réservation(s) ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Les réservations seront définitivement supprimées de la base de données.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBatchDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={batchDeleteMutation.isPending}
              >
                {batchDeleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Batch Cancel Dialog */}
        <AlertDialog open={batchCancelDialogOpen} onOpenChange={setBatchCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler {selectedIds.length} réservation(s) ?</AlertDialogTitle>
              <AlertDialogDescription>
                Veuillez fournir une raison pour l'annulation de ces réservations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="cancellation-reason">Raison de l'annulation</Label>
              <Textarea
                id="cancellation-reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Ex: Demande du client, force majeure, etc."
                className="mt-2"
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancellationReason('')}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmBatchCancel}
                disabled={batchUpdateStatusMutation.isPending || !cancellationReason.trim()}
              >
                {batchUpdateStatusMutation.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

