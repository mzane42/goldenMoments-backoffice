/**
 * CalendarManagementDialog Component
 * Full-featured calendar management dialog for managing availability and pricing
 * Can be used by both admins and partners with appropriate permission handling
 */

import * as React from 'react';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { BulkEditSheet } from '@/components/calendar/BulkEditSheet';
import { RoomTypeSelector } from '@/components/calendar/RoomTypeSelector';
import { ManageRoomTypesDialog } from '@/components/dialogs/ManageRoomTypesDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { RoomType } from '@/../../shared/types/entities';
import { localDateKey } from '@/lib/utils';

interface CalendarManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceId: string;
  experienceName: string;
  isAdmin?: boolean;
}

export function CalendarManagementDialog({
  open,
  onOpenChange,
  experienceId,
  experienceName,
  isAdmin = false,
}: CalendarManagementDialogProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = React.useState<string | null>(null);
  const [manageRoomTypesOpen, setManageRoomTypesOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // Get room types for selected experience
  // Use admin endpoints if isAdmin, otherwise use partner endpoints
  const partnerRoomTypesQuery = trpc.partner.roomTypes.list.useQuery(
    { experienceId },
    { enabled: open && !!experienceId && !isAdmin }
  );
  const adminRoomTypesQuery = trpc.admin.roomTypes.list.useQuery(
    { experienceId },
    { enabled: open && !!experienceId && isAdmin }
  );
  const roomTypes = (isAdmin ? adminRoomTypesQuery.data : partnerRoomTypesQuery.data) || [];
  const refetchRoomTypes = isAdmin ? adminRoomTypesQuery.refetch : partnerRoomTypesQuery.refetch;

  // Set default room type
  React.useEffect(() => {
    if (!selectedRoomTypeId && roomTypes.length > 0) {
      setSelectedRoomTypeId(roomTypes[0].id);
    }
  }, [roomTypes, selectedRoomTypeId]);

  // Get availability for current month
  const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // Get availability - use admin endpoints if isAdmin, otherwise use partner endpoints
  const partnerAvailabilityQuery = trpc.partner.availability.getByExperience.useQuery(
    {
      experienceId,
      startDate: localDateKey(startDate),
      endDate: localDateKey(endDate),
      roomTypeId: selectedRoomTypeId || undefined,
    },
    { enabled: open && !!experienceId && !!selectedRoomTypeId && !isAdmin }
  );
  const adminAvailabilityQuery = trpc.admin.availability.getByExperience.useQuery(
    {
      experienceId,
      startDate: localDateKey(startDate),
      endDate: localDateKey(endDate),
      roomTypeId: selectedRoomTypeId || undefined,
    },
    { enabled: open && !!experienceId && !!selectedRoomTypeId && isAdmin }
  );
  const rawAvailability = (isAdmin ? adminAvailabilityQuery.data : partnerAvailabilityQuery.data) || [];
  const refetchAvailability = isAdmin ? adminAvailabilityQuery.refetch : partnerAvailabilityQuery.refetch;

  // Transform snake_case to camelCase for frontend
  const availability = React.useMemo(() => {
    return rawAvailability.map((item: any) => ({
      ...item,
      isAvailable: item.is_available,
      availableRooms: item.available_rooms,
      originalPrice: item.original_price,
      discountPercentage: item.discount_percentage,
      roomTypeId: item.room_type_id,
      experienceId: item.experience_id,
    }));
  }, [rawAvailability]);

  // Mutations - use admin endpoints if isAdmin, otherwise use partner endpoints
  const partnerCreateRoomTypeMutation = trpc.partner.roomTypes.create.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre créé avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const adminCreateRoomTypeMutation = trpc.admin.roomTypes.create.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre créé avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const createRoomTypeMutation = isAdmin ? adminCreateRoomTypeMutation : partnerCreateRoomTypeMutation;

  const partnerUpdateRoomTypeMutation = trpc.partner.roomTypes.update.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre mis à jour avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const adminUpdateRoomTypeMutation = trpc.admin.roomTypes.update.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre mis à jour avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const updateRoomTypeMutation = isAdmin ? adminUpdateRoomTypeMutation : partnerUpdateRoomTypeMutation;

  const partnerDeleteRoomTypeMutation = trpc.partner.roomTypes.delete.useMutation({
    onSuccess: (_data, variables) => {
      toast.success('Type de chambre supprimé avec succès');
      if (variables?.id === selectedRoomTypeId) {
        setSelectedRoomTypeId(null);
        setSelectedDates([]);
      }
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const adminDeleteRoomTypeMutation = trpc.admin.roomTypes.delete.useMutation({
    onSuccess: (_data, variables) => {
      toast.success('Type de chambre supprimé avec succès');
      if (variables?.id === selectedRoomTypeId) {
        setSelectedRoomTypeId(null);
        setSelectedDates([]);
      }
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const deleteRoomTypeMutation = isAdmin ? adminDeleteRoomTypeMutation : partnerDeleteRoomTypeMutation;

  const partnerBulkUpsertMutation = trpc.partner.availability.bulkUpsert.useMutation({
    onSuccess: () => {
      toast.success('Disponibilité mise à jour avec succès');
      refetchAvailability();
      setSelectedDates([]);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const adminBulkUpsertMutation = trpc.admin.availability.bulkUpsert.useMutation({
    onSuccess: () => {
      toast.success('Disponibilité mise à jour avec succès');
      refetchAvailability();
      setSelectedDates([]);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const bulkUpsertMutation = isAdmin ? adminBulkUpsertMutation : partnerBulkUpsertMutation;

  // Get initial form data from first selected date if it has availability
  const getInitialFormData = () => {
    if (selectedDates.length === 0) return null;
    
    const firstDate = localDateKey(selectedDates[0]);
    const existingAvailability = availability.find((a: any) => a.date === firstDate);
    
    if (existingAvailability) {
      return {
        price: existingAvailability.price.toString(),
        originalPrice: existingAvailability.originalPrice.toString(),
        availableRooms: existingAvailability.availableRooms.toString(),
        isAvailable: existingAvailability.isAvailable,
      };
    }
    
    return null;
  };

  const handleBulkSave = (formData: {
    price: string;
    originalPrice: string;
    availableRooms: string;
    isAvailable: boolean;
  }) => {
    if (!experienceId || !selectedRoomTypeId || selectedDates.length === 0) {
      return;
    }

    const periods = selectedDates.map(date => ({
      experience_id: experienceId,
      room_type_id: selectedRoomTypeId,
      date: localDateKey(date),
      price: parseFloat(formData.price),
      original_price: parseFloat(formData.originalPrice),
      available_rooms: parseInt(formData.availableRooms),
      is_available: formData.isAvailable,
    }));

    bulkUpsertMutation.mutate({ periods });
  };

  const handleCopyPreviousWeek = () => {
    toast.info('Fonctionnalité de copie de la semaine précédente à venir');
  };

  const handleCreateRoomType = (data: {
    name: string;
    description: string;
    base_capacity: number;
    max_capacity: number;
  }) => {
    createRoomTypeMutation.mutate({
      experience_id: experienceId,
      ...data,
    });
  };

  const handleUpdateRoomType = (id: string, updates: Partial<RoomType>) => {
    // Filter out null values and convert to expected format
    const cleanUpdates: any = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) {
      cleanUpdates.description =
      updates.description === '' ? null : updates.description;
    }
    if (updates.baseCapacity !== undefined) cleanUpdates.base_capacity = updates.baseCapacity;
    if (updates.maxCapacity !== undefined) cleanUpdates.max_capacity = updates.maxCapacity;
    if (updates.amenities !== undefined) cleanUpdates.amenities = updates.amenities;
    if (updates.images !== undefined) cleanUpdates.images = updates.images;
    
    updateRoomTypeMutation.mutate({ id, updates: cleanUpdates });
  };

  const handleDeleteRoomType = (id: string) => {
    deleteRoomTypeMutation.mutate({ id });
  };

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedDates([]);
      setSelectedRoomTypeId(null);
      setManageRoomTypesOpen(false);
      setIsDragging(false);
    }
  }, [open]);

  if (roomTypes.length === 0 && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gérer le Calendrier</DialogTitle>
            <DialogDescription>{experienceName}</DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun Type de Chambre</h3>
            <p className="text-gray-600 mb-4">
              Créez d'abord un type de chambre pour commencer à gérer la disponibilité
            </p>
            <Button onClick={() => setManageRoomTypesOpen(true)}>
              Créer un Type de Chambre
            </Button>
          </div>
          <ManageRoomTypesDialog
            open={manageRoomTypesOpen}
            onOpenChange={setManageRoomTypesOpen}
            roomTypes={[]}
            experienceId={experienceId}
            experienceName={experienceName}
            onCreate={handleCreateRoomType}
            onUpdate={handleUpdateRoomType}
            onDelete={handleDeleteRoomType}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Gérer le Calendrier</DialogTitle>
                <DialogDescription>{experienceName}</DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchAvailability()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Room Type Selector */}
            {experienceId && (
              <RoomTypeSelector
                roomTypes={roomTypes}
                selectedRoomTypeId={selectedRoomTypeId}
                onSelect={setSelectedRoomTypeId}
                onManageRoomTypes={() => setManageRoomTypesOpen(true)}
              />
            )}

            {/* Main Content - Calendar */}
            {experienceId && selectedRoomTypeId && (
              <div className="space-y-4">
                <CalendarGrid
                  currentMonth={currentMonth}
                  availability={availability}
                  selectedDates={selectedDates}
                  onDateSelect={setSelectedDates}
                  onMonthChange={setCurrentMonth}
                  onDragStateChange={setIsDragging}
                />
                
                {/* Mobile: Selected dates indicator */}
                {selectedDates.length > 0 && !isDragging && (
                  <div className="md:hidden">
                    <Button 
                      onClick={() => {/* Sheet opens automatically */}} 
                      className="w-full"
                      size="lg"
                    >
                      Modifier {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet - Opens when dates are selected AND not dragging */}
      <BulkEditSheet
        open={selectedDates.length > 0 && !isDragging}
        selectedDatesCount={selectedDates.length}
        onSave={handleBulkSave}
        onCancel={() => setSelectedDates([])}
        onCopyPreviousWeek={handleCopyPreviousWeek}
        isLoading={bulkUpsertMutation.isPending}
        initialData={getInitialFormData()}
      />

      {/* Manage Room Types Dialog */}
      <ManageRoomTypesDialog
        open={manageRoomTypesOpen}
        onOpenChange={setManageRoomTypesOpen}
        roomTypes={roomTypes}
        experienceId={experienceId}
        experienceName={experienceName}
        onCreate={handleCreateRoomType}
        onUpdate={handleUpdateRoomType}
        onDelete={handleDeleteRoomType}
      />
    </>
  );
}

