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
    cell: (row) => (
      <span className="font-mono text-sm font-medium">
        {row.bookingReference}
      </span>
    ),
  },
  {
    id: 'user',
    header: 'Client',
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.user?.fullName || 'Client inconnu'}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.user?.email || '-'}
        </span>
      </div>
    ),
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
    id: 'checkInDate',
    header: "Date d'arrivée",
    accessorKey: 'checkInDate',
    enableSorting: true,
    cell: (row) => formatDate(row.checkInDate),
  },
  {
    id: 'checkOutDate',
    header: 'Date de départ',
    accessorKey: 'checkOutDate',
    enableSorting: true,
    cell: (row) => formatDate(row.checkOutDate),
  },
  {
    id: 'guestCount',
    header: 'Personnes',
    accessorKey: 'guestCount',
    cell: (row) => (
      <span className="text-sm">{row.guestCount}</span>
    ),
  },
  {
    id: 'totalPrice',
    header: 'Montant',
    accessorKey: 'totalPrice',
    enableSorting: true,
    cell: (row) => (
      <span className="font-semibold">
        {formatCurrency(row.totalPrice)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    enableSorting: true,
    cell: (row) => {
      const badgeInfo = getReservationStatusBadge(row.status);
      return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
    },
  },
  {
    id: 'paymentStatus',
    header: 'Paiement',
    accessorKey: 'paymentStatus',
    enableSorting: true,
    cell: (row) => {
      const badgeInfo = getPaymentStatusBadge(row.paymentStatus);
      return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
    },
  },
  {
    id: 'createdAt',
    header: 'Créé le',
    accessorKey: 'createdAt',
    enableSorting: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

