/**
 * Partner Experiences Page
 * CRUD interface for managing partner's own experiences
 */

import * as React from 'react';
import PartnerLayout from '@/components/PartnerLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { experiencesColumns } from '@/components/data-table/columns/experiences-columns';
import { ViewDetailsDialog, type DetailSection } from '@/components/dialogs/ViewDetailsDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { CreateExperienceDialog } from '@/components/dialogs/CreateExperienceDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Plus, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { ExperienceWithRelations } from '@/../../shared/types/entities';
import type { CreateExperienceInput } from '@/../../shared/schemas/experience';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getExperienceStatusBadge,
} from '@/lib/format';

export default function PartnerExperiences() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedExperience, setSelectedExperience] = React.useState<ExperienceWithRelations | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingExperience, setDeletingExperience] = React.useState<ExperienceWithRelations | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingExperience, setEditingExperience] = React.useState<ExperienceWithRelations | null>(null);

  // Fetch partner's experiences
  const { data, isLoading, error, refetch } = trpc.partner.experiences.list.useQuery({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.debouncedSearchValue,
    sortColumn: tableState.sortConfig?.column,
    sortDirection: tableState.sortConfig?.direction,
  });

  // Create mutation
  const createMutation = trpc.partner.experiences.create.useMutation({
    onSuccess: () => {
      toast.success('Expérience créée avec succès');
      setCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
      console.error('Form submission error:', error);
    },
  });

  // Update mutation
  const updateMutation = trpc.partner.experiences.update.useMutation({
    onSuccess: () => {
      toast.success('Expérience modifiée avec succès');
      setEditDialogOpen(false);
      setEditingExperience(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
      console.error('Form submission error:', error);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.partner.experiences.delete.useMutation({
    onSuccess: () => {
      toast.success('Expérience supprimée avec succès');
      setDeleteDialogOpen(false);
      setDeletingExperience(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleView = (experience: ExperienceWithRelations) => {
    setSelectedExperience(experience);
    setViewDialogOpen(true);
  };

  const handleEdit = (experience: ExperienceWithRelations) => {
    setEditingExperience(experience);
    setEditDialogOpen(true);
  };

  const handleDelete = (experience: ExperienceWithRelations) => {
    setDeletingExperience(experience);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExperience) return;
    await deleteMutation.mutateAsync({ id: deletingExperience.id });
  };

  const handleCreate = async (data: CreateExperienceInput) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: CreateExperienceInput & { id?: string }) => {
    if (!data.id) return;
    await updateMutation.mutateAsync({ 
      id: parseInt(data.id), 
      updates: data 
    });
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
    <PartnerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes expériences</h1>
            <p className="text-muted-foreground mt-1">
              Gérez toutes vos expériences proposées
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle expérience
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={experiencesColumns}
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
          searchPlaceholder="Rechercher par titre, catégorie..."
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
          emptyStateDescription="Vous n'avez pas encore d'expériences. Créez-en une nouvelle pour commencer."
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
          loading={deleteMutation.isPending}
        />

        {/* Create Experience Dialog */}
        <CreateExperienceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreate}
          partners={[]}
          loading={createMutation.isPending}
        />

        {/* Edit Experience Dialog */}
        <CreateExperienceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdate}
          partners={[]}
          loading={updateMutation.isPending}
          initialData={editingExperience}
          mode="edit"
        />
      </div>
    </PartnerLayout>
  );
}

