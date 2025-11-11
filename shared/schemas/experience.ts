/**
 * Validation schemas for Experience entity
 */

import { z } from 'zod';

// Location schema
export const locationSchema = z.object({
  area: z.string().optional(),
  city: z.string().min(1, 'La ville est requise'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Items/Amenities schema
export const itemsSchema = z.object({
  amenities: z.array(z.string()),
});

// Check-in info schema
export const checkInInfoSchema = z.object({
  check_in: z.string().optional(),
  check_out: z.string().optional(),
});

// Transportation schema
export const transportationSchema = z.object({
  parking: z.string().optional(),
  nearest_airport: z.object({
    name: z.string().optional(),
    distance: z.string().optional(),
  }).optional(),
});

// Accessibility schema
export const accessibilitySchema = z.object({
  elevator: z.boolean(),
  accessible_rooms: z.boolean(),
  wheelchair_accessible: z.boolean(),
});

// Additional info schema
export const additionalInfoSchema = z.object({
  pets_allowed: z.boolean(),
  smoking_policy: z.string().optional(),
  languages_spoken: z.array(z.string()),
});

// Schedules schema
export const schedulesSchema = z.object({
  pool: z.string().optional(),
  breakfast: z.string().optional(),
  dinner: z.string().optional(),
  fitness_center: z.string().optional(),
});

// Extra item schema (optional add-ons)
export const extraItemSchema = z.object({
  label: z.string().min(1, 'Le label est requis'),
  emoji: z.string().min(1, 'L\'emoji est requis'),
  price: z.number().min(0, 'Le prix doit être positif'),
});

// Extras schema
export const extrasSchema = z.array(extraItemSchema).optional().default([]);

// Payment methods schema
export const paymentMethodsSchema = z.array(
  z.enum(['pay_at_hotel', 'card', 'apple_pay', 'dahbia', 'bank_transfer'])
).min(1, 'Au moins une méthode de paiement doit être sélectionnée').default(['pay_at_hotel']);

// Main experience creation schema
export const createExperienceSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  long_description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  images: z.array(z.string().url('URL d\'image invalide')).min(1, 'Au moins une image est requise'),
  image_url: z.string().url('URL d\'image invalide').optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  location: locationSchema,
  items: itemsSchema.optional(),
  check_in_info: checkInInfoSchema.optional(),
  transportation: transportationSchema.optional(),
  accessibility: accessibilitySchema.optional(),
  additional_info: additionalInfoSchema.optional(),
  schedules: schedulesSchema.optional(),
  extras: extrasSchema.optional(),
  allowed_nights: z.array(z.number().int().positive().max(30)).min(1, 'Au moins une durée de nuit doit être sélectionnée').default([1, 2, 3]),
  payment_methods: paymentMethodsSchema.optional(),
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  partner_id: z.string().uuid().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
});

// Update experience schema (all fields optional except id)
export const updateExperienceSchema = createExperienceSchema.partial().extend({
  id: z.string().uuid(),
});

// Type inference
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;

