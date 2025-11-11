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
import { MDXEditorComponent } from '@/components/ui/mdxeditor';
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
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { X, Plus, Upload, MapPin, Info, Loader2 } from 'lucide-react';
import { createExperienceSchema, type CreateExperienceInput } from '@/../../shared/schemas/experience';
import { uploadImages, generateBucketPath } from '@/lib/supabaseUpload';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export interface CreateExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExperienceInput & { id?: string }) => void | Promise<void>;
  partners?: Array<{ id: string; hotelName: string }>;
  loading?: boolean;
  initialData?: any; // Experience data for edit mode
  mode?: 'create' | 'edit';
  isPartner?: boolean; // If true, applies partner restrictions
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
  isPartner = false,
}: CreateExperienceDialogProps) {
  const isEditMode = mode === 'edit' && initialData;
  const isActiveExperience = isEditMode && initialData?.status === 'active';
  const isReadOnly = isPartner && isActiveExperience;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm<CreateExperienceInput>({
    resolver: zodResolver(createExperienceSchema) as any,
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
      extras: [],
      allowed_nights: [1, 2, 3], // Default: flexible booking (1-3 nights)
      payment_methods: ['pay_at_hotel'], // Default payment method
      date_start: '',
      date_end: '',
      company: '',
      status: isPartner ? 'inactive' : 'active',
      partner_id: undefined,
      is_featured: false,
    },
  });

  const images = watch('images') || [];
  const amenities = watch('items.amenities') || [];
  const languages = watch('additional_info.languages_spoken') || [];
  const extras = watch('extras') || [];
  const paymentMethods = watch('payment_methods') || ['pay_at_hotel'];
  const longDescription = watch('long_description') || '';
  const title = watch('title') || '';

  const [newImage, setNewImage] = React.useState('');
  const [newAmenity, setNewAmenity] = React.useState('');
  const [newExtra, setNewExtra] = React.useState({ label: '', emoji: '', price: 0 });
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = React.useState(false);
  const [roomTypeImages, setRoomTypeImages] = React.useState<Record<string, File[]>>({});
  const [uploadingRoomTypeId, setUploadingRoomTypeId] = React.useState<string | null>(null);

  // Fetch room types for this experience (only in edit mode)
  const { data: roomTypes, refetch: refetchRoomTypes } = trpc.admin.roomTypes.list.useQuery(
    { experienceId: initialData?.id || '' },
    { enabled: Boolean(isEditMode && initialData?.id) }
  );

  // Mutation for updating room type images
  const updateRoomTypeMutation = trpc.admin.roomTypes.update.useMutation({
    onSuccess: () => {
      refetchRoomTypes();
      toast.success('Images du type de chambre mises à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour des images');
      console.error('Error updating room type:', error);
    },
  });

  const currentPartnerId = initialData?.partner_id ?? initialData?.partnerId;

  // Merge partners list with current assigned partner (if editing and partner not in list)
  const displayPartners = React.useMemo(() => {
    if (!isEditMode || !currentPartnerId) {
      return partners;
    }
    
    // Check if current partner is already in the list
    const partnerExists = partners.some((p) => p.id === currentPartnerId);
    if (partnerExists) {
      return partners;
    }
    
    // If partner not in list, add it with a placeholder name
    // This can happen if the partner is from a different company or was deleted
    return [
      { id: currentPartnerId, hotelName: '(Partenaire actuel)' },
      ...partners,
    ];
  }, [currentPartnerId, isEditMode, partners]);

  // Populate form when editing
  React.useEffect(() => {
    if (!isEditMode || !initialData) return;

    reset({
      title: initialData.title ?? '',
      description: initialData.description ?? '',
      long_description:
        initialData.long_description ?? initialData.longDescription ?? '',
      price: initialData.price ?? 0,
      images: initialData.images ?? [],
      image_url: initialData.image_url ?? initialData.imageUrl ?? '',
      category: initialData.category ?? 'hotel',
      location:
        initialData.location ?? { area: '', city: '', latitude: 0, longitude: 0 },
      items: initialData.items ?? { amenities: [] },
      check_in_info:
        initialData.check_in_info ??
        initialData.checkInInfo ?? { check_in: '', check_out: '' },
      transportation:
        initialData.transportation ?? {
          parking: '',
          nearest_airport: { name: '', distance: '' },
        },
      accessibility:
        initialData.accessibility ?? {
          elevator: false,
          accessible_rooms: false,
          wheelchair_accessible: false,
        },
      additional_info:
        initialData.additional_info ??
        initialData.additionalInfo ?? {
          pets_allowed: false,
          smoking_policy: '',
          languages_spoken: [],
        },
      schedules:
        initialData.schedules ??
        initialData.schedules ??
        { breakfast: '', dinner: '', pool: '', fitness_center: '' },
      extras: initialData.extras ?? [],
      allowed_nights: initialData.allowed_nights ?? initialData.allowedNights ?? [1, 2, 3],
      payment_methods: initialData.payment_methods ?? initialData.paymentMethods ?? ['pay_at_hotel'],
      date_start: initialData.date_start ?? initialData.dateStart ?? '',
      date_end: initialData.date_end ?? initialData.dateEnd ?? '',
      company: initialData.company ?? '',
      status: initialData.status ?? (isPartner ? 'inactive' : 'active'),
      partner_id: currentPartnerId ?? undefined,
      is_featured: initialData.is_featured ?? initialData.isFeatured ?? false,
    });
  }, [currentPartnerId, initialData, isEditMode, isPartner, reset]);

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

  const addExtra = () => {
    if (newExtra.label.trim() && newExtra.emoji.trim() && newExtra.price >= 0) {
      setValue('extras', [...extras, {
        label: newExtra.label.trim(),
        emoji: newExtra.emoji.trim(),
        price: newExtra.price
      }]);
      setNewExtra({ label: '', emoji: '', price: 0 });
    }
  };

  const removeExtra = (index: number) => {
    setValue('extras', extras.filter((_, i) => i !== index));
  };

  const handleRoomTypeImageUpload = async (roomTypeId: string, roomTypeName: string) => {
    const files = roomTypeImages[roomTypeId];
    if (!files || files.length === 0) {
      toast.info('Aucune image à télécharger');
      return;
    }

    try {
      setUploadingRoomTypeId(roomTypeId);
      toast.info('Téléchargement des images...');

      // Generate bucket path for room type images
      const bucketPath = generateBucketPath(title, initialData?.id, `room-types/${roomTypeName}`);

      // Upload images
      const uploadResults = await uploadImages(files, bucketPath);

      // Check for errors
      const errors = uploadResults.filter(result => result.error);
      if (errors.length > 0) {
        toast.error(`Échec du téléchargement de ${errors.length} image(s)`);
        setUploadingRoomTypeId(null);
        return;
      }

      // Get URLs from successful uploads
      const uploadedUrls = uploadResults.map(result => result.url);

      // Find current room type to get existing images
      const currentRoomType = roomTypes?.find(rt => rt.id === roomTypeId);
      const existingImages = currentRoomType?.images || [];

      // Combine with existing images
      const allImages = [...existingImages, ...uploadedUrls];

      // Update room type with new images
      await updateRoomTypeMutation.mutateAsync({
        id: roomTypeId,
        updates: { images: allImages },
      });

      // Clear uploaded files for this room type
      setRoomTypeImages(prev => ({ ...prev, [roomTypeId]: [] }));
      setUploadingRoomTypeId(null);
    } catch (error) {
      setUploadingRoomTypeId(null);
      toast.error('Erreur lors du téléchargement');
      console.error('Room type image upload error:', error);
    }
  };

  const handleFormSubmit = async (data: CreateExperienceInput) => {
    if (isReadOnly) {
      return; // Prevent submission for active experiences when partner
    }

    try {
      // Upload images if there are new files
      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        toast.info('Téléchargement des images...');

        // Generate bucket path
        const experienceId = isEditMode ? initialData?.id : undefined;
        const bucketPath = generateBucketPath(data.title, experienceId);

        // Upload images
        const uploadResults = await uploadImages(imageFiles, bucketPath);

        // Check for errors
        const errors = uploadResults.filter(result => result.error);
        if (errors.length > 0) {
          toast.error(`Échec du téléchargement de ${errors.length} image(s)`);
          setIsUploadingImages(false);
          return;
        }

        // Get URLs from successful uploads
        const uploadedUrls = uploadResults.map(result => result.url);

        // Combine with existing images (for edit mode)
        const allImages = [...data.images, ...uploadedUrls];

        // Update data with uploaded image URLs
        data.images = allImages;
        data.image_url = allImages[0] || data.image_url;

        setIsUploadingImages(false);
        toast.success('Images téléchargées avec succès');
      }

      // Submit form
      if (isEditMode && initialData?.id) {
        await onSubmit({ ...data, id: initialData.id });
      } else {
        await onSubmit(data);
      }

      if (!isEditMode) {
        reset();
        setImageFiles([]);
      }
      onOpenChange(false);
    } catch (error) {
      setIsUploadingImages(false);
      toast.error('Erreur lors de la soumission');
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
            {isReadOnly
              ? 'Cette expérience est active et ne peut pas être modifiée. Veuillez contacter l\'équipe Golden Moments pour toute modification.'
              : isEditMode 
                ? 'Modifiez les informations de l\'expérience. Les champs marqués d\'un * sont obligatoires.'
                : 'Remplissez tous les champs nécessaires. Les champs marqués d\'un * sont obligatoires.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
          <ScrollArea className="flex-1 px-6">
            {isReadOnly && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Expérience active - Modification non autorisée
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Les expériences actives ne peuvent pas être modifiées par les partenaires. Veuillez contacter l'équipe Golden Moments pour toute modification.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="location">Localisation</TabsTrigger>
                <TabsTrigger value="amenities">Équipements</TabsTrigger>
                <TabsTrigger value="room-types">Types de Chambres</TabsTrigger>
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
                      disabled={isReadOnly}
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
                        <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
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
                    disabled={isReadOnly}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Long Description (Rich Text) */}
                <div className="space-y-2">
                    <Controller
                      name="long_description"
                      control={control}
                      render={({ field }) => (
                        <MDXEditorComponent
                          label="Description détaillée"
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Écrivez une description détaillée de l'expérience. Utilisez la barre d'outils pour formater votre texte..."
                          rows={15}
                        />
                      )}
                    />
                </div>

                <Separator />

                {/* Price & Status */}
                <div className={`grid gap-4 ${isPartner ? 'grid-cols-2' : 'grid-cols-3'}`}>
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
                      disabled={isReadOnly}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  {!isPartner && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
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
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      {...register('company')}
                      placeholder="Ex: Marriott International"
                    />
                  </div>
                </div>

                {!isPartner && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_featured">Expérience mise en avant</Label>
                        <p className="text-sm text-muted-foreground">
                          Afficher cette expérience dans la section "La Golden Family"
                        </p>
                      </div>
                      <Controller
                        name="is_featured"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="is_featured"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                {/* Allowed Nights */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Durées de séjour autorisées *</Label>
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez les nombres de nuits que les clients peuvent réserver
                    </p>
                  </div>
                  <Controller
                    name="allowed_nights"
                    control={control}
                    render={({ field }) => {
                      const allowedNights = field.value || [1, 2, 3];
                      const toggleNight = (night: number) => {
                        if (allowedNights.includes(night)) {
                          const newValue = allowedNights.filter((n) => n !== night);
                          // Ensure at least one night is selected
                          if (newValue.length > 0) {
                            field.onChange(newValue);
                          }
                        } else {
                          field.onChange([...allowedNights, night].sort((a, b) => a - b));
                        }
                      };

                      return (
                        <div className="flex flex-wrap gap-2 p-4 rounded-lg border bg-muted/20">
                          {[1, 2, 3, 4, 5, 7].map((night) => (
                            <Badge
                              key={night}
                              variant={allowedNights.includes(night) ? 'default' : 'outline'}
                              className="cursor-pointer text-sm py-2 px-4"
                              onClick={() => toggleNight(night)}
                            >
                              {night} {night === 1 ? 'nuit' : 'nuits'}
                            </Badge>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Au moins une durée doit être sélectionnée. Les clients ne pourront réserver que les durées autorisées.
                  </p>
                </div>

                <Separator />

                {/* Payment Methods */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Méthodes de paiement disponibles *</Label>
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez les méthodes de paiement acceptées pour cette expérience
                    </p>
                  </div>
                  <Controller
                    name="payment_methods"
                    control={control}
                    render={({ field }) => {
                      const selectedMethods = field.value || ['pay_at_hotel'];
                      const toggleMethod = (method: 'pay_at_hotel' | 'card' | 'apple_pay' | 'dahbia' | 'bank_transfer') => {
                        if (selectedMethods.includes(method)) {
                          const newValue = selectedMethods.filter((m) => m !== method);
                          // Ensure at least one method is selected
                          if (newValue.length > 0) {
                            field.onChange(newValue);
                          }
                        } else {
                          field.onChange([...selectedMethods, method]);
                        }
                      };

                      const paymentMethodOptions: Array<{
                        value: 'pay_at_hotel' | 'card' | 'apple_pay' | 'dahbia' | 'bank_transfer';
                        label: string;
                        icon: string;
                      }> = [
                        { value: 'pay_at_hotel', label: 'Paiement à l\'hôtel', icon: '🏨' },
                        { value: 'card', label: 'Carte bancaire', icon: '💳' },
                        { value: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
                        { value: 'dahbia', label: 'Dahbia', icon: '💳' },
                        { value: 'bank_transfer', label: 'Virement CCP Golden Moments', icon: '🏦' },
                      ];

                      return (
                        <div className="space-y-3">
                          {paymentMethodOptions.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                              onClick={() => !isReadOnly && toggleMethod(option.value)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{option.icon}</span>
                                <Label className="cursor-pointer font-normal">
                                  {option.label}
                                </Label>
                              </div>
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  selectedMethods.includes(option.value)
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground/30'
                                }`}
                              >
                                {selectedMethods.includes(option.value) && (
                                  <svg
                                    className="w-3 h-3 text-primary-foreground"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Au moins une méthode de paiement doit être sélectionnée. Les clients ne pourront utiliser que les méthodes autorisées.
                  </p>
                </div>

                <Separator />

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

                {errors.images && (
                  <p className="text-sm text-destructive">
                    {errors.images.message || 'Au moins une image est requise'}
                  </p>
                )}

                {/* Existing Images (Edit Mode) */}
                {isEditMode && images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Images existantes</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg border overflow-hidden bg-muted"
                        >
                          <img
                            src={img}
                            alt={`Image existante ${index + 1}`}
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
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                <div className="space-y-2">
                  <Label>{isEditMode ? 'Ajouter de nouvelles images' : 'Images de l\'expérience *'}</Label>
                  <ImageUpload
                    files={imageFiles}
                    onChange={setImageFiles}
                    maxImages={10}
                    disabled={isReadOnly || isUploadingImages}
                    showMainBadge={!isEditMode || images.length === 0}
                  />
                </div>
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

                <Separator />

                {/* Extras (Optional Add-ons) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Options supplémentaires (Extras)</h3>

                  <div className="space-y-2">
                    <Label>Ajouter un extra</Label>
                    <div className="grid grid-cols-12 gap-2">
                      <Input
                        value={newExtra.emoji}
                        onChange={(e) => setNewExtra({ ...newExtra, emoji: e.target.value })}
                        placeholder="Emoji"
                        maxLength={2}
                        className="col-span-1"
                      />
                      <Input
                        value={newExtra.label}
                        onChange={(e) => setNewExtra({ ...newExtra, label: e.target.value })}
                        placeholder="Ex: Pétales de rose, bouquet de fleurs, etc."
                        className="col-span-6"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExtra();
                          }
                        }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newExtra.price}
                        onChange={(e) => setNewExtra({ ...newExtra, price: +e.target.value || 0 })}
                        placeholder="Prix"
                        className="col-span-4"
                      />
                      <Button type="button" onClick={addExtra} size="icon" className="col-span-1">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {extras.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 rounded-lg border bg-muted/20">
                      {extras.map((extra, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-2 text-sm py-1.5 px-3"
                        >
                          <span>{extra.emoji}</span>
                          <span>{extra.label}</span>
                          <span className="font-semibold">{extra.price.toFixed(2)}€</span>
                          <button
                            type="button"
                            onClick={() => removeExtra(index)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ===== ROOM TYPES TAB ===== */}
              <TabsContent value="room-types" className="space-y-6 pb-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Info className="h-5 w-5" />
                  <span className="text-sm">
                    Gérez les images pour chaque type de chambre de cette expérience
                  </span>
                </div>

                {!isEditMode ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
                    <Info className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Créez d'abord l'expérience
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Les types de chambres et leurs images peuvent être gérés après la création de l'expérience
                    </p>
                  </div>
                ) : !roomTypes || roomTypes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
                    <Info className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Aucun type de chambre trouvé
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créez des types de chambres via la gestion des types de chambres avant d'ajouter des images
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {roomTypes.map((roomType) => (
                      <AccordionItem key={roomType.id} value={roomType.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{roomType.name}</span>
                              {roomType.description && (
                                <span className="text-sm text-muted-foreground mt-1">
                                  {roomType.description}
                                </span>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {roomType.images?.length || 0} image(s)
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          {/* Existing Images */}
                          {roomType.images && roomType.images.length > 0 && (
                            <div className="space-y-2">
                              <Label>Images existantes</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {roomType.images.map((img: string, index: number) => (
                                  <div
                                    key={index}
                                    className="relative rounded-lg border overflow-hidden bg-muted aspect-square"
                                  >
                                    <img
                                      src={img}
                                      alt={`${roomType.name} image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          'https://via.placeholder.com/400x300?text=Image+Error';
                                      }}
                                    />
                                    {index === 0 && (
                                      <Badge className="absolute top-2 left-2 bg-primary">
                                        Principale
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Images Upload */}
                          <div className="space-y-2">
                            <Label>Ajouter de nouvelles images</Label>
                            <ImageUpload
                              files={roomTypeImages[roomType.id] || []}
                              onChange={(files) => {
                                setRoomTypeImages(prev => ({ ...prev, [roomType.id]: files }));
                              }}
                              maxImages={10}
                              disabled={isReadOnly || uploadingRoomTypeId === roomType.id}
                              showMainBadge={!roomType.images || roomType.images.length === 0}
                            />
                          </div>

                          {/* Save Button */}
                          {(roomTypeImages[roomType.id]?.length || 0) > 0 && (
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                onClick={() => handleRoomTypeImageUpload(roomType.id, roomType.name)}
                                disabled={uploadingRoomTypeId === roomType.id}
                              >
                                {uploadingRoomTypeId === roomType.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Téléchargement...
                                  </>
                                ) : (
                                  'Enregistrer les images'
                                )}
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
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
                setImageFiles([]);
                onOpenChange(false);
              }}
              disabled={loading || isUploadingImages}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || isReadOnly || isUploadingImages}>
              {isUploadingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Téléchargement des images...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Modification en cours...' : 'Création en cours...'}
                </>
              ) : (
                isEditMode ? 'Modifier l\'expérience' : 'Créer l\'expérience'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

