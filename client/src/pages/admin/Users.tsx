/**
 * Admin Users Page
 * CRUD interface for managing all users
 */

import * as React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { usersColumns } from '@/components/data-table/columns/users-columns';
import { ViewDetailsDialog, type DetailSection } from '@/components/dialogs/ViewDetailsDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTableState } from '@/hooks/useTableState';
import { trpc } from '@/lib/trpc';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/../../shared/types/entities';
import {
  formatDate,
  formatDateTime,
  formatPhone,
  getInitials,
} from '@/lib/format';

export default function AdminUsers() {
  const tableState = useTableState({ initialPageSize: 20 });
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);

  // Fetch users
  const { data, isLoading, error, refetch } = trpc.admin.users.list.useQuery({
    page: tableState.page,
    pageSize: tableState.pageSize,
    search: tableState.debouncedSearchValue,
    sortColumn: tableState.sortConfig?.column,
    sortDirection: tableState.sortConfig?.direction,
  });

  // Delete mutation
  const deleteMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      toast.success('Utilisateur supprimé avec succès');
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    // TODO Phase 2: Implement edit dialog
    toast.info('Modification à implémenter');
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    await deleteMutation.mutateAsync({ id: deletingUser.id });
  };

  // Prepare view details sections
  const viewSections: DetailSection[] = selectedUser
    ? [
        {
          title: 'Informations personnelles',
          fields: [
            { 
              label: 'Avatar', 
              value: (
                <Avatar className="h-16 w-16">
                  {selectedUser.profilePicture && (
                    <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.fullName || ''} />
                  )}
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>
              ) 
            },
            { label: 'Nom complet', value: selectedUser.fullName || '-' },
            { label: 'Email', value: selectedUser.email },
            { label: 'Téléphone', value: formatPhone(selectedUser.phoneNumber) },
          ],
        },
        {
          title: 'Informations système',
          fields: [
            { label: 'ID utilisateur', value: selectedUser.id },
            { label: 'Auth ID', value: selectedUser.authId },
            { label: 'Inscrit le', value: formatDateTime(selectedUser.createdAt) },
            { label: 'Dernière modification', value: formatDateTime(selectedUser.updatedAt) },
          ],
        },
        {
          title: 'Préférences',
          fields: [
            { 
              label: 'Préférences', 
              value: selectedUser.preferences && Object.keys(selectedUser.preferences).length > 0
                ? JSON.stringify(selectedUser.preferences, null, 2)
                : 'Aucune préférence définie',
              fullWidth: true 
            },
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
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground mt-1">
              Gérez tous les utilisateurs de la plateforme
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={usersColumns}
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
          searchPlaceholder="Rechercher par nom, email, téléphone..."
          sortConfig={tableState.sortConfig}
          onSortChange={tableState.setSortConfig}
          renderRowActions={(row) => (
            <DataTableRowActions
              onView={() => handleView(row)}
              onEdit={() => handleEdit(row)}
              onDelete={() => handleDelete(row)}
            />
          )}
          emptyStateTitle="Aucun utilisateur"
          emptyStateDescription="Aucun utilisateur trouvé. Créez-en un nouveau pour commencer."
          emptyStateIcon={<UsersIcon className="h-12 w-12" />}
        />

        {/* View Dialog */}
        <ViewDetailsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          title="Détails de l'utilisateur"
          description={selectedUser?.email}
          sections={viewSections}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Supprimer cet utilisateur ?"
          itemName={deletingUser?.fullName || deletingUser?.email}
          loading={deleteMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

