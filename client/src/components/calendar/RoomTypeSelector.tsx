/**
 * RoomTypeSelector Component
 * Tab selector for switching between different room types
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { RoomType } from '@/../../shared/types/entities';
import { cn } from '@/lib/utils';

interface RoomTypeSelectorProps {
  roomTypes: RoomType[];
  selectedRoomTypeId: string | null;
  onSelect: (roomTypeId: string) => void;
  onManageRoomTypes?: () => void;
}

export function RoomTypeSelector({
  roomTypes,
  selectedRoomTypeId,
  onSelect,
  onManageRoomTypes,
}: RoomTypeSelectorProps) {
  if (roomTypes.length === 0) {
    return (
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div>
          <h3 className="font-medium text-yellow-900">Aucun Type de Chambre</h3>
          <p className="text-sm text-yellow-700">Créez un type de chambre pour commencer à gérer la disponibilité</p>
        </div>
        {onManageRoomTypes && (
          <Button onClick={onManageRoomTypes} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Type
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Type de Chambre</h3>
        {onManageRoomTypes && (
          <Button onClick={onManageRoomTypes} variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Gérer
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {roomTypes.map((roomType) => (
          <button
            key={roomType.id}
            onClick={() => onSelect(roomType.id)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-all text-sm font-medium',
              selectedRoomTypeId === roomType.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            )}
          >
            <div className="flex flex-col items-start">
              <span>{roomType.name}</span>
              <span className="text-xs opacity-75">
                {roomType.baseCapacity}-{roomType.maxCapacity} guests
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

