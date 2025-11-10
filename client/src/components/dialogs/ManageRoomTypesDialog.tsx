/**
 * ManageRoomTypesDialog Component
 * Dialog for CRUD operations on room types
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { RoomType } from '@/../../shared/types/entities';

interface ManageRoomTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomTypes: RoomType[];
  experienceId: string;
  onCreate: (data: {
    name: string;
    description: string;
    base_capacity: number;
    max_capacity: number;
  }) => void;
  onUpdate: (id: string, data: Partial<RoomType>) => void;
  onDelete: (id: string) => void;
}

export function ManageRoomTypesDialog({
  open,
  onOpenChange,
  roomTypes,
  experienceId,
  onCreate,
  onUpdate,
  onDelete,
}: ManageRoomTypesDialogProps) {
  const [mode, setMode] = React.useState<'list' | 'create' | 'edit'>('list');
  const [editingRoomType, setEditingRoomType] = React.useState<RoomType | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    base_capacity: 2,
    max_capacity: 4,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_capacity: 2,
      max_capacity: 4,
    });
    setEditingRoomType(null);
    setMode('list');
  };

  const handleCreate = () => {
    setMode('create');
  };

  const handleEdit = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setFormData({
      name: roomType.name,
      description: roomType.description || '',
      base_capacity: roomType.baseCapacity,
      max_capacity: roomType.maxCapacity,
    });
    setMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      onCreate({
        name: formData.name,
        description: formData.description,
        base_capacity: formData.base_capacity,
        max_capacity: formData.max_capacity,
      });
    } else if (mode === 'edit' && editingRoomType) {
      onUpdate(editingRoomType.id, {
        name: formData.name,
        description: formData.description,
        baseCapacity: formData.base_capacity,
        maxCapacity: formData.max_capacity,
      });
    }
    
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de chambre ? Cela supprimera également toutes les données de disponibilité associées.')) {
      onDelete(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'list' && 'Gérer les Types de Chambres'}
            {mode === 'create' && 'Créer un Type de Chambre'}
            {mode === 'edit' && 'Modifier le Type de Chambre'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'list' && 'Ajoutez, modifiez ou supprimez les types de chambres pour cette expérience'}
            {mode === 'create' && 'Créez un nouveau type de chambre avec capacité et équipements'}
            {mode === 'edit' && 'Mettez à jour les informations du type de chambre'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'list' && (
          <div className="space-y-4">
            <Button onClick={handleCreate} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Type de Chambre
            </Button>

            {roomTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun type de chambre pour le moment. Créez-en un pour commencer.
              </div>
            ) : (
              <div className="space-y-2">
                {roomTypes.map((roomType) => (
                  <div
                    key={roomType.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{roomType.name}</h4>
                      <p className="text-sm text-gray-600">
                        {roomType.description || 'Aucune description'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Capacité: {roomType.baseCapacity}-{roomType.maxCapacity} personnes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(roomType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(roomType.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(mode === 'create' || mode === 'edit') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Type de Chambre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Suite Deluxe, Chambre Standard"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brève description du type de chambre"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_capacity">Capacité de Base *</Label>
                <Input
                  id="base_capacity"
                  type="number"
                  min="1"
                  value={formData.base_capacity}
                  onChange={(e) => setFormData({ ...formData, base_capacity: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_capacity">Capacité Maximale *</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  min={formData.base_capacity}
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Créer' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

