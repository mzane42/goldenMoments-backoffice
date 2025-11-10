/**
 * Admin Experiences Page
 * CRUD interface for managing all experiences
 */

import * as React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { experiencesColumns } from '@/components/data-table/columns/experiences-columns';
import { ViewDetailsDialog, type DetailSection } from '@/components/dialogs/ViewDetailsDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Plus, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { ExperienceWithRelations } from '@/../../shared/types/entities';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getExperienceStatusBadge,
  truncate,
} from '@/lib/format';

export default function AdminExperiences() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedExperience, setSelectedExperience] = React.useState<ExperienceWithRelations | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingExperience, setDeletingExperience] = React.useState<ExperienceWithRelations | null>(null);

  // Mock data for now - TODO: Replace with actual tRPC query
  const data = {
    data: [] as ExperienceWithRelations[],
    total: 0,
  };
  const isLoading = false;
  const error = null;

  const handleView = (experience: ExperienceWithRelations) => {
    setSelectedExperience(experience);
    setViewDialogOpen(true);
  };

  const handleEdit = (experience: ExperienceWithRelations) => {
    // TODO Phase 2: Implement edit dialog
    toast.info('Modification à implémenter');
  };

  const handleDelete = (experience: ExperienceWithRelations) => {
    setDeletingExperience(experience);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExperience) return;
    // TODO: Implement actual delete
    toast.success('Expérience supprimée avec succès');
    setDeleteDialogOpen(false);
    setDeletingExperience(null);
  };

  // Prepare view details sections
  const viewSections: DetailSection[] = selectedExperience
    ? [
        {
          title: 'Informations générales',
          fields: [
            { label: 'Titre', value: selectedExperience.title, fullWidth: true },
            { label: 'Catégorie', value: selectedExperience.category },
            { label: 'Statut', value: <Badge variant={getExperienceStatusBadge(selectedExperience.status).variant}>{getExperienceStatusBadge(selectedExperience.status).label}</Badge> },
            { label: 'Prix', value: formatCurrency(selectedExperience.price) },
            { label: 'Partenaire', value: selectedExperience.company || selectedExperience.partner?.hotelName || '-' },
          ],
        },
        {
          title: 'Description',
          fields: [
            { label: 'Description courte', value: selectedExperience.description, fullWidth: true },
            { label: 'Description longue', value: selectedExperience.longDescription || '-', fullWidth: true },
          ],
        },
        {
          title: 'Localisation',
          fields: [
            { label: 'Ville', value: selectedExperience.location?.city || '-' },
            { label: 'Pays', value: selectedExperience.location?.country || '-' },
            { label: 'Adresse', value: selectedExperience.location?.address || '-', fullWidth: true },
          ],
        },
        {
          title: 'Évaluations',
          fields: [
            { 
              label: 'Note moyenne', 
              value: (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{selectedExperience.rating.toFixed(1)}</span>
                </div>
              ) 
            },
            { label: "Nombre d'avis", value: selectedExperience.reviewCount },
          ],
        },
        {
          title: 'Dates',
          fields: [
            { label: 'Date de début', value: formatDate(selectedExperience.dateStart) },
            { label: 'Date de fin', value: formatDate(selectedExperience.dateEnd) },
          ],
        },
        {
          title: 'Informations système',
          fields: [
            { label: 'Créé le', value: formatDateTime(selectedExperience.createdAt) },
            { label: 'Modifié le', value: formatDateTime(selectedExperience.updatedAt) },
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
            <h1 className="text-3xl font-bold text-foreground">Expériences</h1>
            <p className="text-muted-foreground mt-1">
              Gérez toutes les expériences disponibles sur la plateforme
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle expérience
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={experiencesColumns}
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
          searchPlaceholder="Rechercher par titre, catégorie, partenaire..."
          sortConfig={tableState.sortConfig}
          onSortChange={tableState.setSortConfig}
          renderRowActions={(row) => (
            <DataTableRowActions
              onView={() => handleView(row)}
              onEdit={() => handleEdit(row)}
              onDelete={() => handleDelete(row)}
            />
          )}
          emptyStateTitle="Aucune expérience"
          emptyStateDescription="Aucune expérience trouvée. Créez-en une nouvelle pour commencer."
          emptyStateIcon={<ShoppingBag className="h-12 w-12" />}
        />

        {/* View Dialog */}
        <ViewDetailsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          title="Détails de l'expérience"
          description={selectedExperience?.title}
          sections={viewSections}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Supprimer cette expérience ?"
          itemName={deletingExperience?.title}
          loading={false}
        />
      </div>
    </AdminLayout>
  );
}

