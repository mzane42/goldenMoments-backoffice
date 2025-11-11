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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { RoomType } from '@/../../shared/types/entities';
import { uploadImages, generateBucketPath } from '@/lib/supabaseUpload';
import { toast } from 'sonner';

interface ManageRoomTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomTypes: RoomType[];
  experienceId: string;
  experienceName: string;
  onCreate: (data: {
    name: string;
    description: string;
    base_capacity: number;
    max_capacity: number;
    size?: number;
    bed_type?: string;
    amenities?: string[];
    images?: string[];
  }) => void;
  onUpdate: (id: string, data: Partial<RoomType>) => void;
  onDelete: (id: string) => void;
}

export function ManageRoomTypesDialog({
  open,
  onOpenChange,
  roomTypes,
  experienceId,
  experienceName,
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
    size: '',
    bed_type: '',
    amenities: '',
  });
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_capacity: 2,
      max_capacity: 4,
      size: '',
      bed_type: '',
      amenities: '',
    });
    setImageFiles([]);
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
      size: roomType.size?.toString() || '',
      bed_type: roomType.bedType || '',
      amenities: Array.isArray(roomType.amenities) ? roomType.amenities.join(', ') : '',
    });
    setMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedImageUrls: string[] = [];

    // Upload images if there are any
    if (imageFiles.length > 0) {
      setIsUploading(true);
      toast.info('Téléchargement des images...');

      try {
        // Generate bucket path
        const bucketPath = generateBucketPath(
          experienceName,
          experienceId,
          `room-types/${formData.name}`
        );

        // Upload images
        const uploadResults = await uploadImages(imageFiles, bucketPath);

        // Check for errors
        const errors = uploadResults.filter(result => result.error);
        if (errors.length > 0) {
          toast.error(`Échec du téléchargement de ${errors.length} image(s)`);
          setIsUploading(false);
          return;
        }

        // Get URLs from successful uploads
        uploadedImageUrls = uploadResults.map(result => result.url);
        toast.success('Images téléchargées avec succès');
      } catch (error) {
        toast.error('Erreur lors du téléchargement des images');
        console.error('Image upload error:', error);
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    }

    if (mode === 'create') {
      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      onCreate({
        name: formData.name,
        description: formData.description,
        base_capacity: formData.base_capacity,
        max_capacity: formData.max_capacity,
        size: formData.size ? parseInt(formData.size) : undefined,
        bed_type: formData.bed_type || undefined,
        amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined,
        images: uploadedImageUrls,
      });
    } else if (mode === 'edit' && editingRoomType) {
      // Combine existing images with new uploads
      const existingImages = editingRoomType.images || [];
      const allImages = [...existingImages, ...uploadedImageUrls];

      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      onUpdate(editingRoomType.id, {
        name: formData.name,
        description: formData.description,
        baseCapacity: formData.base_capacity,
        maxCapacity: formData.max_capacity,
        size: formData.size ? parseInt(formData.size) : null,
        bedType: formData.bed_type || null,
        amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined,
        images: uploadedImageUrls.length > 0 ? allImages : undefined,
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
      <DialogContent className="max-full sm:max-w-[40vw] max-h-[80vh] overflow-y-auto">
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
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                        <span>Capacité: {roomType.baseCapacity}-{roomType.maxCapacity} personnes</span>
                        {roomType.size && <span>• {roomType.size} m²</span>}
                        {roomType.bedType && <span>• {roomType.bedType}</span>}
                      </div>
                      {Array.isArray(roomType.amenities) && roomType.amenities.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Équipements: {roomType.amenities.join(', ')}
                        </p>
                      )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Taille (m²)</Label>
                <Input
                  id="size"
                  type="number"
                  min="1"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="ex: 28"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bed_type">Type de Lit</Label>
                <Input
                  id="bed_type"
                  value={formData.bed_type}
                  onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
                  placeholder="ex: Lit king size"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Équipements</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="ex: Douche, Baignoire, TV, Mini bar"
              />
              <p className="text-sm text-muted-foreground">
                Séparez les équipements par des virgules
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Images du type de chambre</Label>
              {mode === 'edit' && editingRoomType?.images && editingRoomType.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Images existantes</p>
                  <div className="grid grid-cols-3 gap-2">
                    {editingRoomType.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg border overflow-hidden">
                        <img
                          src={img}
                          alt={`${editingRoomType.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ImageUpload
                files={imageFiles}
                onChange={setImageFiles}
                maxImages={10}
                disabled={isUploading}
                showMainBadge={!editingRoomType?.images || editingRoomType.images.length === 0}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm} disabled={isUploading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  mode === 'create' ? 'Créer' : 'Mettre à jour'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

