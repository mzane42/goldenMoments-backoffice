/**
 * Column definitions for Users table
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { DataTableColumn } from '../DataTable';
import type { User } from '@/../../shared/types/entities';
import {
  formatDate,
  formatPhone,
  getInitials,
} from '@/lib/format';

export const usersColumns: DataTableColumn<User>[] = [
  {
    id: 'avatar',
    header: '',
    cell: (row) => (
      <Avatar className="h-8 w-8">
        {row.profilePicture && (
          <AvatarImage src={row.profilePicture} alt={row.fullName || ''} />
        )}
        <AvatarFallback>
          {getInitials(row.fullName)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    id: 'fullName',
    header: 'Nom complet',
    accessorKey: 'fullName',
    enableSorting: true,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.fullName || 'Sans nom'}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.email}
        </span>
      </div>
    ),
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    enableSorting: true,
    cell: (row) => (
      <span className="text-sm">
        {row.email}
      </span>
    ),
  },
  {
    id: 'phoneNumber',
    header: 'Téléphone',
    accessorKey: 'phoneNumber',
    cell: (row) => (
      <span className="text-sm">
        {formatPhone(row.phoneNumber)}
      </span>
    ),
  },
  {
    id: 'authId',
    header: 'Auth ID',
    accessorKey: 'authId',
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.authId.substring(0, 8)}...
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Inscrit le',
    accessorKey: 'createdAt',
    enableSorting: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
  {
    id: 'updatedAt',
    header: 'Modifié le',
    accessorKey: 'updatedAt',
    enableSorting: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.updatedAt)}
      </span>
    ),
  },
];

