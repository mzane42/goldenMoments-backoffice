/**
 * Reservation Statistics Cards Component
 * Displays key metrics for reservations
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

interface ReservationStatsProps {
  stats: {
    totalReservations: number;
    totalRevenue: number;
    pendingPaymentsCount: number;
    upcomingCheckInsCount: number;
  };
  loading?: boolean;
}

export function ReservationStats({ stats, loading }: ReservationStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Reservations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Réservations
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReservations}</div>
          <p className="text-xs text-muted-foreground">
            Toutes les réservations
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Revenu Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Hors annulations
          </p>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Paiements en attente
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.pendingPaymentsCount}</div>
            {stats.pendingPaymentsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                À traiter
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Réservations non payées
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Check-ins */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Arrivées prochaines
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.upcomingCheckInsCount}</div>
            {stats.upcomingCheckInsCount > 0 && (
              <Badge variant="default" className="text-xs">
                7 jours
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Check-ins dans 7 jours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

