/**
 * Partner Reservations Page
 * CRUD interface for managing reservations for partner's experiences only
 */

import * as React from 'react';
import PartnerLayout from '@/components/PartnerLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { reservationsColumns } from '@/components/data-table/columns/reservations-columns';
import { ViewDetailsDialog, type DetailSection } from '@/components/dialogs/ViewDetailsDialog';
import { GuestDetailsDialog } from '@/components/dialogs/GuestDetailsDialog';
import { ManageReservationDialog } from '@/components/dialogs/ManageReservationDialog';
import { ReservationStats } from '@/components/reservations/ReservationStats';
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Calendar, Download, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';
import type { ReservationWithRelations } from '@/../../shared/types/entities';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getReservationStatusBadge,
  getPaymentStatusBadge,
  truncate,
} from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { exportReservationsToCSV } from '@/lib/export';

export default function PartnerReservations() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedReservation, setSelectedReservation] = React.useState<ReservationWithRelations | null>(null);
  
  // Guest details dialog state
  const [guestDialogOpen, setGuestDialogOpen] = React.useState(false);
  const [guestDialogReservation, setGuestDialogReservation] = React.useState<ReservationWithRelations | null>(null);
  
  // Manage reservation dialog state (read-only for partners)
  const [manageDialogOpen, setManageDialogOpen] = React.useState(false);
  const [manageDialogReservation, setManageDialogReservation] = React.useState<ReservationWithRelations | null>(null);

  // Fetch partner's reservations
  const { data, isLoading, error } = trpc.partner.reservations.list.useQuery({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.debouncedSearchValue,
    sortColumn: tableState.sortConfig?.column,
    sortDirection: tableState.sortConfig?.direction,
  });

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = trpc.partner.reservations.stats.useQuery();

  const handleView = (reservation: ReservationWithRelations) => {
    setSelectedReservation(reservation);
    setViewDialogOpen(true);
  };

  const handleEdit = (reservation: ReservationWithRelations) => {
    // TODO Phase 2: Implement edit dialog
    toast.info('Modification à implémenter');
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

  const handleExportCSV = () => {
    if (data?.data) {
      exportReservationsToCSV(data.data);
      toast.success('Export CSV réussi');
    }
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
            { label: 'Notes', value: selectedReservation.adminNotes || '-', fullWidth: true },
          ],
        },
      ]
    : [];

  return (
    <PartnerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes réservations</h1>
            <p className="text-muted-foreground mt-1">
              Consultez toutes les réservations pour vos expériences
            </p>
          </div>
          <Button variant="outline" onClick={handleExportCSV} disabled={!data?.data || data.data.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
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
          renderRowActions={(row) => (
            <DataTableRowActions
              onView={() => handleView(row)}
              onEdit={() => handleManageReservation(row)}
              additionalActions={[
                {
                  label: 'Voir les détails',
                  icon: <Settings className="mr-2 h-4 w-4" />,
                  onClick: () => handleManageReservation(row),
                },
                {
                  label: 'Voir les invités',
                  icon: <Users className="mr-2 h-4 w-4" />,
                  onClick: () => handleViewGuests(row),
                },
              ]}
            />
          )}
          emptyStateTitle="Aucune réservation"
          emptyStateDescription="Vous n'avez pas encore de réservations."
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

        {/* Manage Reservation Dialog (read-only for partners) */}
        {manageDialogReservation && (
          <ManageReservationDialog
            open={manageDialogOpen}
            onOpenChange={setManageDialogOpen}
            reservation={manageDialogReservation}
            onSave={async () => {}} // No-op for partners
            loading={false}
            isPartner={true}
          />
        )}
      </div>
    </PartnerLayout>
  );
}

