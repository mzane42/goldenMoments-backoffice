/**
 * Entity types based on schema.sql
 * These types match the database schema for type safety across frontend and backend
 */

// Base types
export type UUID = string;
export type Timestamp = string;
export type JSONB = Record<string, any>;

// Enums from schema
export type AdminRole = 'super_admin' | 'admin' | 'moderator';
export type ExperienceStatus = 'active' | 'inactive';
export type PartnerStatus = 'active' | 'inactive' | 'pending';
export type NotificationType = 'booking' | 'payment' | 'review' | 'system' | 'marketing';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';
export type ReservationPaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Location type (stored as JSONB)
export interface Location {
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
}

// Admin entity
export interface Admin {
  id: UUID;
  authId: UUID | null;
  fullName: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  email: string;
}

// User entity
export interface User {
  id: UUID;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  profilePicture: string | null;
  preferences: JSONB;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authId: string;
}

// Hotel Partner entity
export interface HotelPartner {
  id: UUID;
  authId: UUID | null;
  hotelName: string;
  contactName: string;
  email: string;
  contactPhone: string | null;
  address: JSONB;
  status: PartnerStatus;
  commissionRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  company: string | null;
}

// Experience entity
export interface Experience {
  id: UUID;
  title: string;
  description: string;
  longDescription: string | null;
  price: number;
  images: string[];
  category: string;
  location: Location;
  rating: number;
  reviewCount: number;
  items: JSONB;
  checkInInfo: JSONB;
  transportation: JSONB;
  accessibility: JSONB;
  additionalInfo: JSONB;
  schedules: JSONB;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dateStart: Timestamp | null;
  dateEnd: Timestamp | null;
  company: string | null;
  imageUrl: string | null;
  status: ExperienceStatus;
  createdBy: UUID | null;
  lastModifiedBy: UUID | null;
  partnerId: UUID | null;
  allowedNights: number[]; // Allowed night durations (e.g., [1,2,3] = flexible, [2] = 2-nights only)
}

// Price Breakdown (stored as JSONB in reservations)
export interface PriceBreakdown {
  nights: number;
  roomType: string;
  nightlyRates: Array<{
    date: string;
    price: number;
  }>;
  subtotal: number;
  extras?: Array<{
    label: string;
    price: number;
    quantity: number;
  }>;
  extrasTotal?: number;
  total: number;
}

// Reservation entity
export interface Reservation {
  id: UUID;
  userId: UUID | null;
  experienceId: UUID | null;
  bookingReference: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  roomType: string;
  guestCount: number;
  totalPrice: number;
  status: ReservationStatus;
  paymentStatus: ReservationPaymentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes: string | null;
  cancellationReason: string | null;
  cancelledBy: UUID | null;
  cancelledAt: Timestamp | null;
}

// Review entity
export interface Review {
  id: UUID;
  experienceId: UUID | null;
  userId: UUID | null;
  reservationId: UUID | null;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isPublished: boolean;
  adminResponse: string | null;
  respondedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Payment entity
export interface Payment {
  id: UUID;
  reservationId: UUID | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  paymentProvider: string | null;
  providerResponse: JSONB;
  refundAmount: number;
  refundReason: string | null;
  refundedAt: Timestamp | null;
  paidAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Notification entity
export interface Notification {
  id: UUID;
  userId: UUID | null;
  type: NotificationType;
  title: string;
  message: string;
  data: JSONB;
  isRead: boolean;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}

// Wishlist entity
export interface Wishlist {
  id: UUID;
  userId: UUID | null;
  experienceId: UUID | null;
  createdAt: Timestamp;
}

// Waitlist entity
export interface Waitlist {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Room Type entity
export interface RoomType {
  id: UUID;
  experienceId: UUID;
  name: string;
  description: string | null;
  baseCapacity: number;
  maxCapacity: number;
  size: number | null;
  bedType: string | null;
  amenities: JSONB;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Availability Period entity
export interface AvailabilityPeriod {
  id: UUID;
  experienceId: UUID;
  roomTypeId: UUID;
  date: string; // YYYY-MM-DD format
  price: number;
  originalPrice: number;
  discountPercentage: number;
  availableRooms: number;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Extended types with relations for display purposes
export interface ReservationWithRelations extends Reservation {
  user?: User;
  experience?: Experience;
  roomTypeDetails?: RoomType;
}

export interface ExperienceWithRelations extends Experience {
  partner?: HotelPartner;
}

export interface ReviewWithRelations extends Review {
  user?: User;
  experience?: Experience;
  reservation?: Reservation;
}

export interface AvailabilityPeriodWithRelations extends AvailabilityPeriod {
  roomType?: RoomType;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sort types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

// Filter types (for Phase 2)
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
  value: any;
}

