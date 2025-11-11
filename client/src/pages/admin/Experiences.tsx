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
import { CreateExperienceDialog } from '@/components/dialogs/CreateExperienceDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Plus, ShoppingBag, Star, Calendar as CalendarIcon, Bed } from 'lucide-react';
import { toast } from 'sonner';
import type { ExperienceWithRelations } from '@/../../shared/types/entities';
import type { CreateExperienceInput } from '@/../../shared/schemas/experience';
import { CalendarManagementDialog } from '@/components/calendar/CalendarManagementDialog';
import { ManageRoomTypesDialog } from '@/components/dialogs/ManageRoomTypesDialog';
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

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingExperience, setEditingExperience] = React.useState<ExperienceWithRelations | null>(null);

  // Calendar dialog state
  const [calendarDialogOpen, setCalendarDialogOpen] = React.useState(false);
  const [calendarExperience, setCalendarExperience] = React.useState<ExperienceWithRelations | null>(null);

  // Room types dialog state
  const [roomTypesDialogOpen, setRoomTypesDialogOpen] = React.useState(false);
  const [roomTypesExperience, setRoomTypesExperience] = React.useState<ExperienceWithRelations | null>(null);

  // Fetch experiences
  const { data, isLoading, error, refetch } = trpc.admin.experiences.list.useQuery({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.debouncedSearchValue,
    sortColumn: tableState.sortConfig?.column,
    sortDirection: tableState.sortConfig?.direction,
  });

  // Fetch partners for dropdown
  const { data: partnersData } = trpc.admin.partners.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  const partners = partnersData?.data || [];

  // Create mutation
  const createMutation = trpc.admin.experiences.create.useMutation({
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
  const updateMutation = trpc.admin.experiences.update.useMutation({
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
  const deleteMutation = trpc.admin.experiences.delete.useMutation({
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

  const handleManageCalendar = (experience: ExperienceWithRelations) => {
    setCalendarExperience(experience);
    setCalendarDialogOpen(true);
  };

  const handleManageRoomTypes = (experience: ExperienceWithRelations) => {
    setRoomTypesExperience(experience);
    setRoomTypesDialogOpen(true);
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
      id: data.id, 
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
              value: selectedExperience.rating != null ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{selectedExperience.rating.toFixed(1)}</span>
                </div>
              ) : (
                '-'
              ),
            },
            { label: "Nombre d'avis", value: selectedExperience.reviewCount ?? 0 },
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
          searchPlaceholder="Rechercher par titre, catégorie, partenaire..."
          sortConfig={tableState.sortConfig}
          onSortChange={tableState.setSortConfig}
          renderRowActions={(row) => (
            <DataTableRowActions
              onView={() => handleView(row)}
              onEdit={() => handleEdit(row)}
              onDelete={() => handleDelete(row)}
              additionalActions={[
                {
                  label: 'Gérer les types de chambres',
                  icon: <Bed className="h-4 w-4" />,
                  onClick: () => handleManageRoomTypes(row),
                },
                {
                  label: 'Gérer le calendrier',
                  icon: <CalendarIcon className="h-4 w-4" />,
                  onClick: () => handleManageCalendar(row),
                },
              ]}
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
          loading={deleteMutation.isPending}
        />

        {/* Create Experience Dialog */}
        <CreateExperienceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreate}
          partners={partners}
          loading={createMutation.isPending}
        />

        {/* Edit Experience Dialog */}
        <CreateExperienceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdate}
          partners={partners}
          loading={updateMutation.isPending}
          initialData={editingExperience}
          mode="edit"
        />

        {/* Calendar Management Dialog */}
        {calendarExperience && (
          <CalendarManagementDialog
            open={calendarDialogOpen}
            onOpenChange={setCalendarDialogOpen}
            experienceId={calendarExperience.id}
            experienceName={calendarExperience.title}
            isAdmin={true}
          />
        )}

        {/* Room Types Management Dialog */}
        {roomTypesExperience && (
          <RoomTypesManagement
            experienceId={roomTypesExperience.id}
            experienceName={roomTypesExperience.title}
            open={roomTypesDialogOpen}
            onOpenChange={setRoomTypesDialogOpen}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Room Types Management Component
function RoomTypesManagement({
  experienceId,
  experienceName,
  open,
  onOpenChange,
}: {
  experienceId: string;
  experienceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Fetch room types
  const { data: roomTypes = [], refetch } = trpc.admin.roomTypes.list.useQuery(
    { experienceId },
    { enabled: open }
  );

  // Create mutation
  const createMutation = trpc.admin.roomTypes.create.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre créé avec succès');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = trpc.admin.roomTypes.update.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre modifié avec succès');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.admin.roomTypes.delete.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre supprimé avec succès');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync({
      experience_id: experienceId,
      ...data,
    });
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateMutation.mutateAsync({
      id,
      updates: data,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  return (
    <ManageRoomTypesDialog
      open={open}
      onOpenChange={onOpenChange}
      roomTypes={roomTypes}
      experienceId={experienceId}
      experienceName={experienceName}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}

