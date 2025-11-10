/**
 * Create Experience Dialog
 * Comprehensive form for creating new experiences with all schema fields
 */

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, MapPin, Info } from 'lucide-react';
import { createExperienceSchema, type CreateExperienceInput } from '@/../../shared/schemas/experience';

export interface CreateExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExperienceInput & { id?: string }) => void | Promise<void>;
  partners?: Array<{ id: string; hotelName: string }>;
  loading?: boolean;
  initialData?: any; // Experience data for edit mode
  mode?: 'create' | 'edit';
}

const CATEGORIES = [
  { value: 'hotel', label: 'Hôtel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'spa', label: 'Spa & Bien-être' },
  { value: 'adventure', label: 'Aventure' },
  { value: 'culture', label: 'Culture' },
  { value: 'autre', label: 'Autre' },
];

const LANGUAGES = ['Français', 'Arabe', 'Anglais', 'Espagnol', 'Allemand'];

export function CreateExperienceDialog({
  open,
  onOpenChange,
  onSubmit,
  partners = [],
  loading = false,
  initialData,
  mode = 'create',
}: CreateExperienceDialogProps) {
  const isEditMode = mode === 'edit' && initialData;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm<CreateExperienceInput>({
    resolver: zodResolver(createExperienceSchema),
    defaultValues: {
      title: '',
      description: '',
      long_description: '',
      price: 0,
      images: [],
      image_url: '',
      category: 'hotel',
      location: {
        area: '',
        city: '',
        latitude: 0,
        longitude: 0,
      },
      items: { amenities: [] },
      check_in_info: { check_in: '', check_out: '' },
      transportation: { parking: '', nearest_airport: { name: '', distance: '' } },
      accessibility: {
        elevator: false,
        accessible_rooms: false,
        wheelchair_accessible: false,
      },
      additional_info: {
        pets_allowed: false,
        smoking_policy: '',
        languages_spoken: [],
      },
      schedules: {
        breakfast: '',
        dinner: '',
        pool: '',
        fitness_center: '',
      },
      date_start: '',
      date_end: '',
      company: '',
      status: 'active',
      partner_id: undefined,
    },
  });

  const images = watch('images') || [];
  const amenities = watch('items.amenities') || [];
  const languages = watch('additional_info.languages_spoken') || [];
  const longDescription = watch('long_description') || '';

  const [newImage, setNewImage] = React.useState('');
  const [newAmenity, setNewAmenity] = React.useState('');

  // Merge partners list with current assigned partner (if editing and partner not in list)
  const displayPartners = React.useMemo(() => {
    if (!isEditMode || !initialData?.partner_id) {
      return partners;
    }
    
    // Check if current partner is already in the list
    const partnerExists = partners.some(p => p.id === initialData.partner_id);
    if (partnerExists) {
      return partners;
    }
    
    // If partner not in list, add it with a placeholder name
    // This can happen if the partner is from a different company or was deleted
    return [
      { id: initialData.partner_id, hotelName: '(Partenaire actuel)' },
      ...partners,
    ];
  }, [isEditMode, initialData, partners]);

  // Populate form when editing
  React.useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        long_description: initialData.long_description || '',
        price: initialData.price || 0,
        images: initialData.images || [],
        image_url: initialData.image_url || '',
        category: initialData.category || 'hotel',
        location: initialData.location || { area: '', city: '', latitude: 0, longitude: 0 },
        items: initialData.items || { amenities: [] },
        check_in_info: initialData.check_in_info || { check_in: '', check_out: '' },
        transportation: initialData.transportation || { parking: '', nearest_airport: { name: '', distance: '' } },
        accessibility: initialData.accessibility || { elevator: false, accessible_rooms: false, wheelchair_accessible: false },
        additional_info: initialData.additional_info || { pets_allowed: false, smoking_policy: '', languages_spoken: [] },
        schedules: initialData.schedules || { breakfast: '', dinner: '', pool: '', fitness_center: '' },
        date_start: initialData.date_start || '',
        date_end: initialData.date_end || '',
        company: initialData.company || '',
        status: initialData.status || 'active',
        partner_id: initialData.partner_id || undefined,
      });
    }
  }, [isEditMode, initialData, reset]);

  const addImage = () => {
    if (newImage.trim()) {
      const currentImages = [...images, newImage.trim()];
      setValue('images', currentImages);
      if (images.length === 0) {
        setValue('image_url', newImage.trim());
      }
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setValue('images', newImages);
    if (index === 0 && newImages.length > 0) {
      setValue('image_url', newImages[0]);
    } else if (newImages.length === 0) {
      setValue('image_url', '');
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setValue('items.amenities', [...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setValue('items.amenities', amenities.filter((a) => a !== amenity));
  };

  const toggleLanguage = (language: string) => {
    if (languages.includes(language)) {
      setValue('additional_info.languages_spoken', languages.filter((l) => l !== language));
    } else {
      setValue('additional_info.languages_spoken', [...languages, language]);
    }
  };

  const handleFormSubmit = async (data: CreateExperienceInput) => {
    try {
      if (isEditMode && initialData?.id) {
        await onSubmit({ ...data, id: initialData.id });
      } else {
        await onSubmit(data);
      }
      if (!isEditMode) {
        reset();
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl"> 
            {isEditMode ? 'Modifier l\'expérience' : 'Créer une nouvelle expérience'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditMode 
              ? 'Modifiez les informations de l\'expérience. Les champs marqués d\'un * sont obligatoires.'
              : 'Remplissez tous les champs nécessaires. Les champs marqués d\'un * sont obligatoires.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
          <ScrollArea className="flex-1 px-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="location">Localisation</TabsTrigger>
                <TabsTrigger value="amenities">Équipements</TabsTrigger>
                <TabsTrigger value="schedules">Horaires</TabsTrigger>
              </TabsList>

              {/* ===== GENERAL TAB ===== */}
              <TabsContent value="general" className="space-y-6 pb-6">
                {/* Title & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'expérience *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Ex: SPA & Gourmandise"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description courte *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Description concise affichée dans les listes"
                    rows={3}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Long Description (Markdown) */}
                <div className="space-y-2">
                  <Controller
                    name="long_description"
                    control={control}
                    render={({ field }) => (
                      <MarkdownEditor
                        label="Description détaillée (Markdown)"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="**Titre**&#10;&#10;Découvrez...&#10;&#10;- Point 1&#10;- Point 2"
                        rows={15}
                      />
                    )}
                  />
                </div>

                <Separator />

                {/* Price & Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (EUR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.price ? 'border-destructive' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      {...register('company')}
                      placeholder="Ex: Marriott International"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_start">Date de début</Label>
                    <Input
                      id="date_start"
                      type="datetime-local"
                      {...register('date_start')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_end">Date de fin</Label>
                    <Input id="date_end" type="datetime-local" {...register('date_end')} />
                  </div>
                </div>

                {/* Partner Selection */}
                {displayPartners.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="partner_id">Partenaire hôtelier (optionnel)</Label>
                    <Controller
                      name="partner_id"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value || 'none'} 
                          onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un partenaire..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">Aucun partenaire</span>
                            </SelectItem>
                            {displayPartners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.hotelName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
              </TabsContent>

              {/* ===== IMAGES TAB ===== */}
              <TabsContent value="images" className="space-y-6 pb-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Info className="h-5 w-5" />
                  <span className="text-sm">
                    La première image sera utilisée comme image principale
                  </span>
                </div>

                <div className="space-y-2">
                  <Label>Ajouter une image *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button type="button" onClick={addImage} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.images && (
                    <p className="text-sm text-destructive">
                      {errors.images.message || 'Au moins une image est requise'}
                    </p>
                  )}
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg border overflow-hidden bg-muted"
                      >
                        <img
                          src={img}
                          alt={`Image ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/400x300?text=Image+Error';
                          }}
                        />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 bg-primary">
                            Image principale
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                          {img}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
                    <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Aucune image ajoutée
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ajoutez des URLs d'images ci-dessus
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ===== LOCATION TAB ===== */}
              <TabsContent value="location" className="space-y-6 pb-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">Informations de localisation et transport</span>
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location.area">Quartier / Zone</Label>
                      <Input
                        id="location.area"
                        {...register('location.area')}
                        placeholder="Ex: Plateau de Lalla Setti"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location.city">Ville *</Label>
                      <Input
                        id="location.city"
                        {...register('location.city')}
                        placeholder="Ex: Tlemcen"
                        className={errors.location?.city ? 'border-destructive' : ''}
                      />
                      {errors.location?.city && (
                        <p className="text-sm text-destructive">
                          {errors.location.city.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location.latitude">Latitude *</Label>
                      <Input
                        id="location.latitude"
                        type="number"
                        step="any"
                        {...register('location.latitude', { valueAsNumber: true })}
                        placeholder="Ex: 34.8828"
                        className={errors.location?.latitude ? 'border-destructive' : ''}
                      />
                      {errors.location?.latitude && (
                        <p className="text-sm text-destructive">
                          {errors.location.latitude.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location.longitude">Longitude *</Label>
                      <Input
                        id="location.longitude"
                        type="number"
                        step="any"
                        {...register('location.longitude', { valueAsNumber: true })}
                        placeholder="Ex: -1.316"
                        className={errors.location?.longitude ? 'border-destructive' : ''}
                      />
                      {errors.location?.longitude && (
                        <p className="text-sm text-destructive">
                          {errors.location.longitude.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Transportation */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Transport & Accès</h3>

                  <div className="space-y-2">
                    <Label htmlFor="transportation.parking">Parking</Label>
                    <Input
                      id="transportation.parking"
                      {...register('transportation.parking')}
                      placeholder="Ex: Parking gratuit sur place"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Aéroport le plus proche</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        {...register('transportation.nearest_airport.name')}
                        placeholder="Nom de l'aéroport"
                      />
                      <Input
                        {...register('transportation.nearest_airport.distance')}
                        placeholder="Distance (ex: 17.5 km)"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Accessibility */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Accessibilité</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label htmlFor="accessibility.elevator" className="cursor-pointer">
                        Ascenseur disponible
                      </Label>
                      <Controller
                        name="accessibility.elevator"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="accessibility.elevator"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label
                        htmlFor="accessibility.accessible_rooms"
                        className="cursor-pointer"
                      >
                        Chambres accessibles PMR
                      </Label>
                      <Controller
                        name="accessibility.accessible_rooms"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="accessibility.accessible_rooms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label
                        htmlFor="accessibility.wheelchair_accessible"
                        className="cursor-pointer"
                      >
                        Accès fauteuil roulant
                      </Label>
                      <Controller
                        name="accessibility.wheelchair_accessible"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="accessibility.wheelchair_accessible"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ===== AMENITIES TAB ===== */}
              <TabsContent value="amenities" className="space-y-6 pb-6">
                {/* Amenities */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Équipements & Services</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Ex: Piscine, Wi-Fi gratuit, Spa..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAmenity();
                          }
                        }}
                      />
                      <Button type="button" onClick={addAmenity} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 rounded-lg border bg-muted/20">
                      {amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="gap-1 text-sm py-1.5 px-3"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Check-in Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Informations d'arrivée</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check_in_info.check_in">Heure de check-in</Label>
                      <Input
                        id="check_in_info.check_in"
                        {...register('check_in_info.check_in')}
                        placeholder="Ex: 14:00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="check_in_info.check_out">Heure de check-out</Label>
                      <Input
                        id="check_in_info.check_out"
                        {...register('check_in_info.check_out')}
                        placeholder="Ex: 12:00"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Informations complémentaires</h3>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label htmlFor="additional_info.pets_allowed" className="cursor-pointer">
                      Animaux de compagnie acceptés
                    </Label>
                    <Controller
                      name="additional_info.pets_allowed"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="additional_info.pets_allowed"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional_info.smoking_policy">
                      Politique de fumeur
                    </Label>
                    <Input
                      id="additional_info.smoking_policy"
                      {...register('additional_info.smoking_policy')}
                      placeholder="Ex: Établissement non-fumeur"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Langues parlées</Label>
                    <div className="flex flex-wrap gap-2 p-4 rounded-lg border bg-muted/20">
                      {LANGUAGES.map((lang) => (
                        <Badge
                          key={lang}
                          variant={languages.includes(lang) ? 'default' : 'outline'}
                          className="cursor-pointer text-sm py-1.5 px-3"
                          onClick={() => toggleLanguage(lang)}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ===== SCHEDULES TAB ===== */}
              <TabsContent value="schedules" className="space-y-6 pb-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Horaires des services</h3>
                  <p className="text-sm text-muted-foreground">
                    Indiquez les horaires d'ouverture de vos services (format: HH:MM-HH:MM)
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedules.breakfast">🥐 Petit-déjeuner</Label>
                      <Input
                        id="schedules.breakfast"
                        {...register('schedules.breakfast')}
                        placeholder="Ex: 06:30-10:00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schedules.dinner">🍽️ Dîner</Label>
                      <Input
                        id="schedules.dinner"
                        {...register('schedules.dinner')}
                        placeholder="Ex: 19:00-22:00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schedules.pool">🏊 Piscine</Label>
                      <Input
                        id="schedules.pool"
                        {...register('schedules.pool')}
                        placeholder="Ex: 08:00-20:00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schedules.fitness_center">💪 Centre de fitness</Label>
                      <Input
                        id="schedules.fitness_center"
                        {...register('schedules.fitness_center')}
                        placeholder="Ex: 06:00-22:00"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (isEditMode ? 'Modification en cours...' : 'Création en cours...') 
                : (isEditMode ? 'Modifier l\'expérience' : 'Créer l\'expérience')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

