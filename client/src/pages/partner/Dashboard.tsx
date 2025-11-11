import PartnerLayout from "@/components/PartnerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Calendar, Euro, TrendingUp } from "lucide-react";

export default function PartnerDashboard() {
  const { data: revenue, isLoading: revenueLoading } = trpc.partner.revenue.useQuery();
  const { data: experiences, isLoading: experiencesLoading } = trpc.partner.experiences.list.useQuery({
    page: 1,
    pageSize: 100,
  });
  const { data: reservations, isLoading: reservationsLoading } = trpc.partner.reservations.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const isLoading = revenueLoading || experiencesLoading || reservationsLoading;

  if (isLoading) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-accent rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-accent rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  const activeExperiences = experiences?.data?.filter((exp) => exp.isActive).length || 0;
  const upcomingReservations = reservations?.data?.filter(
    (res) => res.reservation.status === "confirmed" && new Date(res.reservation.checkInDate) > new Date()
  ).length || 0;

  const revenueChange = revenue?.currentMonthRevenue && revenue?.previousMonthRevenue
    ? ((Number(revenue.currentMonthRevenue) - Number(revenue.previousMonthRevenue)) / Number(revenue.previousMonthRevenue) * 100).toFixed(1)
    : "0";

  const kpis = [
    {
      title: "Revenus mois en cours",
      value: formatCurrency(revenue?.currentMonthRevenue || 0),
      icon: Euro,
      description: `${revenue?.currentMonthBookings || 0} réservations`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Revenus mois précédent",
      value: formatCurrency(revenue?.previousMonthRevenue || 0),
      icon: TrendingUp,
      description: `${Number(revenueChange) > 0 ? "+" : ""}${revenueChange}% vs mois précédent`,
      color: Number(revenueChange) >= 0 ? "text-green-600" : "text-red-600",
      bgColor: Number(revenueChange) >= 0 ? "bg-green-100" : "bg-red-100",
    },
    {
      title: "Expériences actives",
      value: activeExperiences,
      icon: BarChart3,
      description: `${experiences?.data?.length || 0} au total`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Réservations à venir",
      value: upcomingReservations,
      icon: Calendar,
      description: `${reservations?.data?.length || 0} au total`,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <PartnerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de vos performances Golden Moments
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mes expériences */}
        <Card>
          <CardHeader>
            <CardTitle>Mes expériences</CardTitle>
            <CardDescription>
              Vos expériences les plus récentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {experiences?.data && experiences.data.length > 0 ? (
              <div className="space-y-4">
                {experiences.data.slice(0, 5).map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.category} • {exp.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(exp.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ⭐ {exp.rating} ({exp.reviewCount})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune expérience disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Réservations récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Réservations récentes</CardTitle>
            <CardDescription>
              Les dernières réservations reçues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservations?.data && reservations.data.length > 0 ? (
              <div className="space-y-4">
                {reservations.data.slice(0, 5).map((item) => (
                  <div
                    key={item.reservation.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {item.experience?.title || "Expérience supprimée"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.user?.fullName || "Client"} • {item.reservation.guestCount} personnes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(item.reservation.totalPrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.reservation.checkInDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune réservation disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/partner/experiences"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Mes expériences</p>
                  <p className="text-sm text-muted-foreground">Gérer mes offres</p>
                </div>
              </a>
              <a
                href="/partner/calendar"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Calendrier</p>
                  <p className="text-sm text-muted-foreground">Gérer disponibilités</p>
                </div>
              </a>
              <a
                href="/partner/reservations"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Réservations</p>
                  <p className="text-sm text-muted-foreground">Voir les réservations</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  );
}
