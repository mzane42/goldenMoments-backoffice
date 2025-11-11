/**
 * CSV Export Utilities
 * Functions for exporting data to CSV format
 */

import type { ReservationWithRelations } from '@/../../shared/types/entities';
import { formatDate, formatCurrency } from './format';

/**
 * Escapes CSV field content to handle commas, quotes, and newlines
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts reservations to CSV format and triggers download
 */
export function exportReservationsToCSV(
  reservations: ReservationWithRelations[],
  filename?: string
): void {
  // Define CSV headers
  const headers = [
    'Référence',
    'Client',
    'Email',
    'Téléphone',
    'Expérience',
    'Type de chambre',
    'Date d\'arrivée',
    'Date de départ',
    'Nuits',
    'Nombre de personnes',
    'Nombre de chambres',
    'Montant total',
    'Statut',
    'Statut paiement',
    'Notes admin',
    'Date de création',
  ];

  // Convert data to CSV rows
  const rows = reservations.map((reservation) => {
    // Handle both snake_case (from DB) and camelCase (from types)
    const guestDetails = (reservation as any).guest_details || reservation.guestDetails;
    const roomTypeDetails = (reservation as any).roomTypeDetails;
    const numberOfNights = (reservation as any).number_of_nights || reservation.numberOfNights;
    const numberOfRooms = (reservation as any).number_of_rooms || reservation.numberOfRooms;
    
    const guestName = guestDetails?.[0]?.fullName || reservation.user?.fullName || 'Client inconnu';
    const guestEmail = guestDetails?.[0]?.email || reservation.user?.email || '-';
    const guestPhone = guestDetails?.[0]?.phone || reservation.user?.phoneNumber || '-';
    const experienceTitle = reservation.experience?.title || 'Expérience supprimée';
    const roomType = roomTypeDetails?.name || reservation.roomType || '-';
    
    // Calculate nights
    const nights = numberOfNights || 
      (reservation.checkInDate && reservation.checkOutDate
        ? Math.ceil((new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0);

    return [
      escapeCSVField(reservation.bookingReference),
      escapeCSVField(guestName),
      escapeCSVField(guestEmail),
      escapeCSVField(guestPhone),
      escapeCSVField(experienceTitle),
      escapeCSVField(roomType),
      escapeCSVField(formatDate(reservation.checkInDate)),
      escapeCSVField(formatDate(reservation.checkOutDate)),
      escapeCSVField(nights),
      escapeCSVField(reservation.guestCount),
      escapeCSVField(numberOfRooms || 1),
      escapeCSVField(formatCurrency(reservation.totalPrice)),
      escapeCSVField(reservation.status),
      escapeCSVField(reservation.paymentStatus),
      escapeCSVField(reservation.adminNotes || ''),
      escapeCSVField(formatDate(reservation.createdAt)),
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    const defaultFilename = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);
  }
}

/**
 * Exports a single reservation with detailed information
 */
export function exportReservationDetailToCSV(
  reservation: ReservationWithRelations,
  filename?: string
): void {
  const headers = [
    'Type',
    'Information',
  ];

  const rows: string[][] = [
    ['Référence', reservation.bookingReference],
    ['Statut', reservation.status],
    ['Statut paiement', reservation.paymentStatus],
    ['Montant total', formatCurrency(reservation.totalPrice)],
    ['', ''], // Empty row separator
    
    // Guest information
    ['INFORMATIONS CLIENT', ''],
  ];

  // Add all guests
  const guestDetails = (reservation as any).guest_details || reservation.guestDetails;
  if (guestDetails && guestDetails.length > 0) {
    guestDetails.forEach((guest: any, index: number) => {
      rows.push([`Invité ${index + 1} - Nom`, guest.fullName]);
      rows.push([`Invité ${index + 1} - Email`, guest.email]);
      rows.push([`Invité ${index + 1} - Téléphone`, guest.phone]);
      if (guest.specialRequests) {
        rows.push([`Invité ${index + 1} - Demandes`, guest.specialRequests]);
      }
    });
  } else if (reservation.user) {
    rows.push(['Client - Nom', reservation.user.fullName || '-']);
    rows.push(['Client - Email', reservation.user.email || '-']);
    rows.push(['Client - Téléphone', reservation.user.phoneNumber || '-']);
  }

  rows.push(['', '']); // Empty row separator
  
  // Stay details
  const roomTypeDetails = (reservation as any).roomTypeDetails;
  const numberOfNights = (reservation as any).number_of_nights || reservation.numberOfNights;
  const numberOfRooms = (reservation as any).number_of_rooms || reservation.numberOfRooms;
  
  rows.push(['DÉTAILS DU SÉJOUR', '']);
  rows.push(['Expérience', reservation.experience?.title || 'Expérience supprimée']);
  rows.push(['Type de chambre', roomTypeDetails?.name || reservation.roomType || '-']);
  rows.push(['Date d\'arrivée', formatDate(reservation.checkInDate)]);
  rows.push(['Date de départ', formatDate(reservation.checkOutDate)]);
  rows.push(['Nombre de nuits', String(numberOfNights || '-')]);
  rows.push(['Nombre de personnes', String(reservation.guestCount)]);
  rows.push(['Nombre de chambres', String(numberOfRooms || 1)]);

  if (reservation.adminNotes) {
    rows.push(['', '']); // Empty row separator
    rows.push(['NOTES ADMIN', '']);
    rows.push(['Notes', reservation.adminNotes]);
  }

  // Create CSV content
  const csvRows = rows.map(row => 
    row.map(cell => escapeCSVField(cell)).join(',')
  );
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const defaultFilename = `reservation-${reservation.bookingReference}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

