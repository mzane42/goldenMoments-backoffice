/**
 * Column definitions for Partners (Hotel Partners) table
 */

import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import type { DataTableColumn } from '../DataTable';
import type { HotelPartner } from '@/../../shared/types/entities';
import {
  formatDate,
  formatPhone,
  getPartnerStatusBadge,
} from '@/lib/format';

export const partnersColumns: DataTableColumn<HotelPartner>[] = [
  {
    id: 'icon',
    header: '',
    cell: () => (
      <div className="flex items-center justify-center">
        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
      </div>
    ),
  },
  {
    id: 'hotelName',
    header: 'Hôtel',
    accessorKey: 'hotelName',
    enableSorting: true,
    cell: (row) => (
      <div className="max-w-[200px]">
        <div className="font-medium">{row.hotelName}</div>
        {row.company && (
          <div className="text-xs text-muted-foreground">
            {row.company}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {row.contactName}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.email}
        </span>
      </div>
    ),
  },
  {
    id: 'contactPhone',
    header: 'Téléphone',
    accessorKey: 'contactPhone',
    cell: (row) => (
      <span className="text-sm">
        {formatPhone(row.contactPhone)}
      </span>
    ),
  },
  {
    id: 'address',
    header: 'Adresse',
    cell: (row) => {
      const address = row.address as any;
      if (!address || typeof address !== 'object') {
        return <span className="text-sm">-</span>;
      }
      return (
        <div className="max-w-[150px]">
          <div className="text-sm">{address.city || '-'}</div>
          {address.country && (
            <div className="text-xs text-muted-foreground">
              {address.country}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'commissionRate',
    header: 'Commission',
    accessorKey: 'commissionRate',
    enableSorting: true,
    cell: (row) => (
      <span className="font-medium text-sm">
        {row.commissionRate}%
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    enableSorting: true,
    cell: (row) => {
      const badgeInfo = getPartnerStatusBadge(row.status);
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

