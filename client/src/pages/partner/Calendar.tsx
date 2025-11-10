/**
 * Partner Calendar Page
 * Availability and pricing management interface for hotel partners
 */

import * as React from 'react';
import PartnerLayout from '@/components/PartnerLayout';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { BulkEditPanel } from '@/components/calendar/BulkEditPanel';
import { RoomTypeSelector } from '@/components/calendar/RoomTypeSelector';
import { ManageRoomTypesDialog } from '@/components/dialogs/ManageRoomTypesDialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { RoomType } from '@/../../shared/types/entities';

export default function PartnerCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [selectedExperienceId, setSelectedExperienceId] = React.useState<string | null>(null);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = React.useState<string | null>(null);
  const [manageRoomTypesOpen, setManageRoomTypesOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // Get partner's experiences
  const { data: experiencesData } = trpc.partner.experiences.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  const experiences = experiencesData?.data || [];

  // Set default experience
  React.useEffect(() => {
    if (!selectedExperienceId && experiences.length > 0) {
      setSelectedExperienceId(experiences[0].id);
    }
  }, [experiences, selectedExperienceId]);

  // Get room types for selected experience
  const { data: roomTypes = [], refetch: refetchRoomTypes } = trpc.partner.roomTypes.list.useQuery(
    { experienceId: selectedExperienceId || '' },
    { enabled: !!selectedExperienceId }
  );

  // Set default room type
  React.useEffect(() => {
    if (!selectedRoomTypeId && roomTypes.length > 0) {
      setSelectedRoomTypeId(roomTypes[0].id);
    }
  }, [roomTypes, selectedRoomTypeId]);

  // Get availability for current month
  const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data: rawAvailability = [], refetch: refetchAvailability } = trpc.partner.availability.getByExperience.useQuery(
    {
      experienceId: selectedExperienceId || '',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      roomTypeId: selectedRoomTypeId || undefined,
    },
    { enabled: !!selectedExperienceId && !!selectedRoomTypeId }
  );

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

  // Mutations
  const createRoomTypeMutation = trpc.partner.roomTypes.create.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre créé avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateRoomTypeMutation = trpc.partner.roomTypes.update.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre mis à jour avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteRoomTypeMutation = trpc.partner.roomTypes.delete.useMutation({
    onSuccess: () => {
      toast.success('Type de chambre supprimé avec succès');
      refetchRoomTypes();
      setManageRoomTypesOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const bulkUpsertMutation = trpc.partner.availability.bulkUpsert.useMutation({
    onSuccess: () => {
      toast.success('Disponibilité mise à jour avec succès');
      refetchAvailability();
      setSelectedDates([]);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Get initial form data from first selected date if it has availability
  const getInitialFormData = () => {
    if (selectedDates.length === 0) return null;
    
    const firstDate = selectedDates[0].toISOString().split('T')[0];
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
    if (!selectedExperienceId || !selectedRoomTypeId || selectedDates.length === 0) {
      return;
    }

    const periods = selectedDates.map(date => ({
      experience_id: selectedExperienceId,
      room_type_id: selectedRoomTypeId,
      date: date.toISOString().split('T')[0],
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
    if (!selectedExperienceId) return;
    
    createRoomTypeMutation.mutate({
      experience_id: selectedExperienceId,
      ...data,
    });
  };

  const handleUpdateRoomType = (id: string, updates: Partial<RoomType>) => {
    // Filter out null values and convert to expected format
    const cleanUpdates: any = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description || undefined;
    if (updates.baseCapacity !== undefined) cleanUpdates.base_capacity = updates.baseCapacity;
    if (updates.maxCapacity !== undefined) cleanUpdates.max_capacity = updates.maxCapacity;
    if (updates.amenities !== undefined) cleanUpdates.amenities = updates.amenities;
    if (updates.images !== undefined) cleanUpdates.images = updates.images;
    
    updateRoomTypeMutation.mutate({ id, updates: cleanUpdates });
  };

  const handleDeleteRoomType = (id: string) => {
    deleteRoomTypeMutation.mutate({ id });
  };

  if (experiences.length === 0) {
    return (
      <PartnerLayout>
        <div className="container mx-auto py-10">
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucune Expérience</h2>
            <p className="text-gray-600">
              Créez d'abord une expérience avant de gérer la disponibilité
            </p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="container mx-auto py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendrier de Disponibilité</h1>
            <p className="text-gray-600">
              Gérez les prix et la disponibilité de vos expériences
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchAvailability()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Experience Selector */}
        <div className="space-y-2 space-x-4">
          <label className="text-sm font-medium text-gray-700">Sélectionner une Expérience</label>
          <select
            value={selectedExperienceId || ''}
            onChange={(e) => {
              setSelectedExperienceId(e.target.value);
              setSelectedRoomTypeId(null);
              setSelectedDates([]);
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {experiences.map((exp: any) => (
              <option key={exp.id} value={exp.id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type Selector */}
        {selectedExperienceId && (
          <RoomTypeSelector
            roomTypes={roomTypes}
            selectedRoomTypeId={selectedRoomTypeId}
            onSelect={setSelectedRoomTypeId}
            onManageRoomTypes={() => setManageRoomTypesOpen(true)}
          />
        )}

        {/* Main Content - Calendar */}
        {selectedExperienceId && selectedRoomTypeId && (
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
                  onClick={() => {/* Modal opens automatically */}} 
                  className="w-full"
                  size="lg"
                >
                  Modifier {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal - Opens when dates are selected AND not dragging */}
        <BulkEditPanel
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
          experienceId={selectedExperienceId || ''}
          onCreate={handleCreateRoomType}
          onUpdate={handleUpdateRoomType}
          onDelete={handleDeleteRoomType}
        />
      </div>
    </PartnerLayout>
  );
}

