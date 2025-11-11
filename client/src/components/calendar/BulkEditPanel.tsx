/**
 * BulkEditPanel Component
 * Form for editing multiple dates at once (as modal)
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, X, Copy } from 'lucide-react';

interface BulkEditFormData {
  price: string;
  originalPrice: string;
  availableRooms: string;
  isAvailable: boolean;
}

interface BulkEditPanelProps {
  open: boolean;
  selectedDatesCount: number;
  onSave: (formData: BulkEditFormData) => void;
  onCancel: () => void;
  onCopyPreviousWeek?: () => void;
  isLoading?: boolean;
  initialData?: {
    price: string;
    originalPrice: string;
    availableRooms: string;
    isAvailable: boolean;
  } | null;
}

export function BulkEditPanel({
  open,
  selectedDatesCount,
  onSave,
  onCancel,
  onCopyPreviousWeek,
  isLoading = false,
  initialData = null,
}: BulkEditPanelProps) {
  const [formData, setFormData] = React.useState<BulkEditFormData>({
    price: '',
    originalPrice: '',
    availableRooms: '1',
    isAvailable: true,
  });

  // Pre-populate form with existing data when editing
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        price: '',
        originalPrice: '',
        availableRooms: '1',
        isAvailable: true,
      });
    }
  }, [initialData, selectedDatesCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePriceChange = (value: string) => {
    setFormData(prev => ({ ...prev, price: value }));
    
    // Auto-calculate discount if both prices are set
    if (value && formData.originalPrice) {
      const price = parseFloat(value);
      const original = parseFloat(formData.originalPrice);
      if (!isNaN(price) && !isNaN(original) && original > 0) {
        const discount = Math.round(((original - price) / original) * 100);
        console.log(`Discount: ${discount}%`);
      }
    }
  };

  const calculateDiscount = () => {
    const price = parseFloat(formData.price);
    const original = parseFloat(formData.originalPrice);
    
    if (isNaN(price) || isNaN(original) || original === 0) {
      return null;
    }
    
    return Math.round(((original - price) / original) * 100);
  };

  const discount = calculateDiscount();

  const applyWeekdayPattern = () => {
    // Monday-Thursday: -40%
    setFormData({
      price: '180',
      originalPrice: '300',
      availableRooms: '2',
      isAvailable: true,
    });
  };

  const applyWeekendPattern = () => {
    // Friday-Sunday: -30%
    setFormData({
      price: '210',
      originalPrice: '300',
      availableRooms: '2',
      isAvailable: true,
    });
  };

  const isEditingExisting = initialData !== null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col">
            <span>Modifier {selectedDatesCount} Date{selectedDatesCount > 1 ? 's' : ''} Sélectionnée{selectedDatesCount > 1 ? 's' : ''}</span>
            {isEditingExisting && (
              <span className="text-sm font-normal text-blue-600 mt-1">
                Modification des prix existants
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Actions */}
          <div className="space-y-2">
            <Label>Actions Rapides</Label>
            <div className="flex flex-wrap gap-2">
              {onCopyPreviousWeek && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCopyPreviousWeek}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copier Semaine Précédente
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyWeekdayPattern}
              >
                Modèle Semaine
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyWeekendPattern}
              >
                Modèle Week-end
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Prix Golden Moments (EUR)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="ex: 180.00"
              required
            />
          </div>

          {/* Original Price */}
          <div className="space-y-2">
            <Label htmlFor="originalPrice">Prix Public Hôtel (EUR)</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="ex: 300.00"
              required
            />
          </div>

          {/* Discount Display */}
          {discount !== null && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                Réduction: {discount}%
              </div>
              <div className="text-xs text-green-700 mt-1">
                Économie: €{(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toFixed(2)}
              </div>
            </div>
          )}

          {/* Available Rooms */}
          <div className="space-y-2">
            <Label htmlFor="availableRooms">Chambres Disponibles</Label>
            <Input
              id="availableRooms"
              type="number"
              min="0"
              value={formData.availableRooms}
              onChange={(e) => setFormData({ ...formData, availableRooms: e.target.value })}
              required
            />
          </div>

          {/* Is Available Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
            <Label htmlFor="isAvailable">
              Disponible à la réservation
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

