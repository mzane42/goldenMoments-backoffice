/**
 * Formatting utilities for the application
 * Essential helpers for dates, currency, and status badges
 */

import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  AdminRole,
  ExperienceStatus,
  PartnerStatus,
  PaymentStatus,
  ReservationStatus,
  ReservationPaymentStatus,
} from '@/../../shared/types/entities';

/**
 * Format currency in EUR
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'EUR'): string {
  if (amount === null || amount === undefined || !isFinite(amount)) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Format datetime to localized string with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Format date to relative time (e.g., "il y a 2 jours")
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Format date to relative description (e.g., "aujourd'hui à 14:30")
 */
export function formatRelativeDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date(), { locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Format phone number (basic formatting)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  // Simple French phone formatting
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

/**
 * Format number with locale
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Get status badge variant and label for reservation status
 */
export function getReservationStatusBadge(status: ReservationStatus): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmée', variant: 'default' };
    case 'completed':
      return { label: 'Terminée', variant: 'secondary' };
    case 'cancelled':
      return { label: 'Annulée', variant: 'destructive' };
    default:
      return { label: status, variant: 'outline' };
  }
}

/**
 * Get status badge variant and label for payment status
 */
export function getPaymentStatusBadge(status: ReservationPaymentStatus | PaymentStatus): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'paid':
    case 'completed':
      return { label: 'Payé', variant: 'default' };
    case 'pending':
      return { label: 'En attente', variant: 'outline' };
    case 'processing':
      return { label: 'En cours', variant: 'secondary' };
    case 'failed':
      return { label: 'Échoué', variant: 'destructive' };
    case 'refunded':
      return { label: 'Remboursé', variant: 'secondary' };
    default:
      return { label: status, variant: 'outline' };
  }
}

/**
 * Get status badge variant and label for experience status
 */
export function getExperienceStatusBadge(status: ExperienceStatus): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'default' };
    case 'inactive':
      return { label: 'Inactive', variant: 'secondary' };
    default:
      return { label: status, variant: 'outline' };
  }
}

/**
 * Get status badge variant and label for partner status
 */
export function getPartnerStatusBadge(status: PartnerStatus): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'active':
      return { label: 'Actif', variant: 'default' };
    case 'inactive':
      return { label: 'Inactif', variant: 'secondary' };
    case 'pending':
      return { label: 'En attente', variant: 'outline' };
    default:
      return { label: status, variant: 'outline' };
  }
}

/**
 * Get role label for admin role
 */
export function getAdminRoleLabel(role: AdminRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'moderator':
      return 'Modérateur';
    default:
      return role;
  }
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string | null | undefined, length: number = 50): string {
  if (!text) return '-';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// TODO Phase 2: Add Excel export utilities
// TODO Phase 2: Add advanced date range formatters

