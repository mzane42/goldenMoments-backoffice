/**
 * Column definitions for Reservations table
 */

import { Badge } from '@/components/ui/badge';
import type { DataTableColumn } from '../DataTable';
import type { ReservationWithRelations } from '@/../../shared/types/entities';
import {
  formatCurrency,
  formatDate,
  getReservationStatusBadge,
  getPaymentStatusBadge,
  truncate,
} from '@/lib/format';

export const reservationsColumns: DataTableColumn<ReservationWithRelations>[] = [
  {
    id: 'bookingReference',
    header: 'Référence',
    accessorKey: 'bookingReference',
    enableSorting: true,
    cell: (row) => {
      const bookingRef = (row as any).booking_reference || row.bookingReference;
      return (
        <span className="font-mono text-sm font-medium">
          {bookingRef}
        </span>
      );
    },
  },
  {
    id: 'user',
    header: 'Client',
    cell: (row) => {
      // Try to get guest info from guest_details first, then fall back to user
      // Note: database returns snake_case, not camelCase
      const guestDetails = (row as any).guest_details || row.guestDetails;
      const guestName = guestDetails?.[0]?.fullName || row.user?.fullName || 'Client inconnu';
      const guestEmail = guestDetails?.[0]?.email || row.user?.email || '-';
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {guestName}
          </span>
          <span className="text-xs text-muted-foreground">
            {guestEmail}
          </span>
        </div>
      );
    },
  },
  {
    id: 'experience',
    header: 'Expérience',
    cell: (row) => (
      <div className="max-w-[200px]">
        <span className="font-medium">
          {truncate(row.experience?.title || 'Expérience supprimée', 40)}
        </span>
      </div>
    ),
  },
  {
    id: 'roomType',
    header: 'Type de chambre',
    cell: (row) => {
      const roomTypeDetails = (row as any).roomTypeDetails;
      const roomType = (row as any).room_type || row.roomType;
      return (
        <span className="text-sm">
          {roomTypeDetails?.name || roomType || '-'}
        </span>
      );
    },
  },
  {
    id: 'nights',
    header: 'Nuits',
    cell: (row) => {
      const checkInDate = (row as any).check_in_date || row.checkInDate;
      const checkOutDate = (row as any).check_out_date || row.checkOutDate;
      const nights = checkInDate && checkOutDate
        ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return (
        <span className="text-sm font-medium">
          {nights ?? '-'} {nights && (nights === 1 ? 'nuit' : 'nuits')}
        </span>
      );
    },
  },
  {
    id: 'checkInDate',
    header: "Date d'arrivée",
    accessorKey: 'checkInDate',
    enableSorting: true,
    cell: (row) => {
      const checkInDate = (row as any).check_in_date || row.checkInDate;
      return formatDate(checkInDate);
    },
  },
  {
    id: 'checkOutDate',
    header: 'Date de départ',
    accessorKey: 'checkOutDate',
    enableSorting: true,
    cell: (row) => {
      const checkOutDate = (row as any).check_out_date || row.checkOutDate;
      return formatDate(checkOutDate);
    },
  },
  {
    id: 'guestCount',
    header: 'Personnes',
    accessorKey: 'guestCount',
    cell: (row) => {
      const guestCount = (row as any).guest_count || row.guestCount;
      return <span className="text-sm">{guestCount}</span>;
    },
  },
  {
    id: 'totalPrice',
    header: 'Montant',
    accessorKey: 'totalPrice',
    enableSorting: true,
    cell: (row) => {
      const totalPrice = (row as any).total_price || row.totalPrice;
      return (
        <span className="font-semibold">
          {formatCurrency(totalPrice)}
        </span>
      );
    },
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    enableSorting: true,
    cell: (row) => {
      const status = (row as any).status || row.status;
      const badgeInfo = getReservationStatusBadge(status);
      return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
    },
  },
  {
    id: 'paymentStatus',
    header: 'Paiement',
    accessorKey: 'paymentStatus',
    enableSorting: true,
    cell: (row) => {
      const paymentStatus = (row as any).payment_status || row.paymentStatus;
      const badgeInfo = getPaymentStatusBadge(paymentStatus);
      return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
    },
  },
  {
    id: 'createdAt',
    header: 'Créé le',
    accessorKey: 'createdAt',
    enableSorting: true,
    cell: (row) => {
      const createdAt = (row as any).created_at || row.createdAt;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(createdAt)}
        </span>
      );
    },
  },
];

