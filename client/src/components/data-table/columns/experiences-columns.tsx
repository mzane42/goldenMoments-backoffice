/**
 * Column definitions for Experiences table
 */

import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { DataTableColumn } from '../DataTable';
import type { ExperienceWithRelations } from '@/../../shared/types/entities';
import {
  formatCurrency,
  formatDate,
  getExperienceStatusBadge,
  truncate,
} from '@/lib/format';

export const experiencesColumns: DataTableColumn<ExperienceWithRelations>[] = [
  {
    id: 'image',
    header: 'Image',
    cell: (row) => (
      <div className="flex items-center justify-center">
        {row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.title}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">N/A</span>
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'title',
    header: 'Titre',
    accessorKey: 'title',
    enableSorting: true,
    cell: (row) => (
      <div className="max-w-[250px]">
        <div className="font-medium">{truncate(row.title, 50)}</div>
        <div className="text-xs text-muted-foreground">
          {row.category}
        </div>
      </div>
    ),
  },
  {
    id: 'location',
    header: 'Localisation',
    cell: (row) => (
      <div className="max-w-[150px]">
        <div className="text-sm">
          {row.location?.city || '-'}
        </div>
        {row.location?.country && (
          <div className="text-xs text-muted-foreground">
            {row.location.country}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'company',
    header: 'Partenaire',
    accessorKey: 'company',
    cell: (row) => (
      <div className="max-w-[150px]">
        <span className="text-sm">
          {row.company || row.partner?.hotelName || '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'price',
    header: 'Prix',
    accessorKey: 'price',
    enableSorting: true,
    cell: (row) => (
      <span className="font-semibold">
        {formatCurrency(row.price)}
      </span>
    ),
  },
  {
    id: 'rating',
    header: 'Note',
    accessorKey: 'rating',
    enableSorting: true,
    cell: (row) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{(row.rating ?? 0).toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">
          ({row.reviewCount ?? 0})
        </span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    enableSorting: true,
    cell: (row) => {
      const badgeInfo = getExperienceStatusBadge(row.status);
      return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
    },
  },
  {
    id: 'dates',
    header: 'Dates',
    cell: (row) => {
      if (!row.dateStart && !row.dateEnd) return <span className="text-sm">-</span>;
      return (
        <div className="text-xs text-muted-foreground">
          <div>{formatDate(row.dateStart)}</div>
          <div>{formatDate(row.dateEnd)}</div>
        </div>
      );
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

