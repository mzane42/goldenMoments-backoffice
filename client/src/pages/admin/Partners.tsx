/**
 * Admin Partners Page
 * CRUD interface for managing all hotel partners
 */

import * as React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { partnersColumns } from '@/components/data-table/columns/partners-columns';
import { ViewDetailsDialog, type DetailSection } from '@/components/dialogs/ViewDetailsDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { HotelPartner } from '@/../../shared/types/entities';
import {
  formatDate,
  formatDateTime,
  formatPhone,
  getPartnerStatusBadge,
} from '@/lib/format';

export default function AdminPartners() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] = React.useState<HotelPartner | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingPartner, setDeletingPartner] = React.useState<HotelPartner | null>(null);

  // Mock data for now - TODO: Replace with actual tRPC query
  const data = {
    data: [] as HotelPartner[],
    total: 0,
  };
  const isLoading = false;
  const error = null;

  const handleView = (partner: HotelPartner) => {
    setSelectedPartner(partner);
    setViewDialogOpen(true);
  };

  const handleEdit = (partner: HotelPartner) => {
    // TODO Phase 2: Implement edit dialog
    toast.info('Modification à implémenter');
  };

  const handleDelete = (partner: HotelPartner) => {
    setDeletingPartner(partner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPartner) return;
    // TODO: Implement actual delete
    toast.success('Partenaire supprimé avec succès');
    setDeleteDialogOpen(false);
    setDeletingPartner(null);
  };

  // Prepare view details sections
  const viewSections: DetailSection[] = selectedPartner
    ? [
        {
          title: 'Informations générales',
          fields: [
            { label: 'Nom de l\'hôtel', value: selectedPartner.hotelName },
            { label: 'Entreprise', value: selectedPartner.company || '-' },
            { label: 'Statut', value: <Badge variant={getPartnerStatusBadge(selectedPartner.status).variant}>{getPartnerStatusBadge(selectedPartner.status).label}</Badge> },
            { label: 'Commission', value: `${selectedPartner.commissionRate}%` },
          ],
        },
        {
          title: 'Contact',
          fields: [
            { label: 'Nom du contact', value: selectedPartner.contactName },
            { label: 'Email', value: selectedPartner.email },
            { label: 'Téléphone', value: formatPhone(selectedPartner.contactPhone) },
          ],
        },
        {
          title: 'Adresse',
          fields: [
            { 
              label: 'Adresse complète', 
              value: (() => {
                const address = selectedPartner.address as any;
                if (!address || typeof address !== 'object') return '-';
                const parts = [
                  address.address,
                  address.postalCode,
                  address.city,
                  address.country,
                ].filter(Boolean);
                return parts.length > 0 ? parts.join(', ') : '-';
              })(),
              fullWidth: true 
            },
          ],
        },
        {
          title: 'Informations système',
          fields: [
            { label: 'ID partenaire', value: selectedPartner.id },
            { label: 'Auth ID', value: selectedPartner.authId || '-' },
            { label: 'Créé le', value: formatDateTime(selectedPartner.createdAt) },
            { label: 'Modifié le', value: formatDateTime(selectedPartner.updatedAt) },
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
            <h1 className="text-3xl font-bold text-foreground">Partenaires</h1>
            <p className="text-muted-foreground mt-1">
              Gérez tous les partenaires hôteliers de la plateforme
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau partenaire
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={partnersColumns}
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
          searchPlaceholder="Rechercher par nom, contact, email..."
          sortConfig={tableState.sortConfig}
          onSortChange={tableState.setSortConfig}
          renderRowActions={(row) => (
            <DataTableRowActions
              onView={() => handleView(row)}
              onEdit={() => handleEdit(row)}
              onDelete={() => handleDelete(row)}
            />
          )}
          emptyStateTitle="Aucun partenaire"
          emptyStateDescription="Aucun partenaire trouvé. Créez-en un nouveau pour commencer."
          emptyStateIcon={<Building2 className="h-12 w-12" />}
        />

        {/* View Dialog */}
        <ViewDetailsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          title="Détails du partenaire"
          description={selectedPartner?.hotelName}
          sections={viewSections}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Supprimer ce partenaire ?"
          itemName={deletingPartner?.hotelName}
          loading={false}
        />
      </div>
    </AdminLayout>
  );
}

