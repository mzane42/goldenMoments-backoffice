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
import { Button } from '@/components/ui/button';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Calendar } from 'lucide-react';
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

export default function PartnerReservations() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedReservation, setSelectedReservation] = React.useState<ReservationWithRelations | null>(null);

  // Mock data for now - TODO: Replace with actual tRPC query filtered by partner
  // const { data, isLoading, error } = trpc.partner.reservations.list.useQuery({
  //   page: tableState.page,
  //   pageSize: tableState.pageSize,
  //   search: tableState.debouncedSearchValue,
  //   sortColumn: tableState.sortConfig?.column,
  //   sortDirection: tableState.sortConfig?.direction,
  // });

  const data = {
    data: [] as ReservationWithRelations[],
    total: 0,
  };
  const isLoading = false;
  const error = null;

  const handleView = (reservation: ReservationWithRelations) => {
    setSelectedReservation(reservation);
    setViewDialogOpen(true);
  };

  const handleEdit = (reservation: ReservationWithRelations) => {
    // TODO Phase 2: Implement edit dialog
    toast.info('Modification à implémenter');
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
          title: 'Client',
          fields: [
            { label: 'Nom', value: selectedReservation.user?.fullName || '-' },
            { label: 'Email', value: selectedReservation.user?.email || '-' },
            { label: 'Téléphone', value: selectedReservation.user?.phoneNumber || '-' },
          ],
        },
        {
          title: 'Détails du séjour',
          fields: [
            { label: 'Expérience', value: selectedReservation.experience?.title || 'Expérience supprimée', fullWidth: true },
            { label: "Date d'arrivée", value: formatDate(selectedReservation.checkInDate) },
            { label: 'Date de départ', value: formatDate(selectedReservation.checkOutDate) },
            { label: 'Type de chambre', value: selectedReservation.roomType },
            { label: 'Nombre de personnes', value: selectedReservation.guestCount },
          ],
        },
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
        </div>

        {/* DataTable */}
        <DataTable
          columns={reservationsColumns}
          data={data.data}
          loading={isLoading}
          error={error?.message}
          page={tableState.page}
          pageSize={tableState.pageSize}
          total={data.total}
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
              onEdit={() => handleEdit(row)}
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
      </div>
    </PartnerLayout>
  );
}

