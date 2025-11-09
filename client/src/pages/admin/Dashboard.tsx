import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Calendar, Euro, TrendingUp, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  const kpis = [
    {
      title: "Réservations totales",
      value: stats?.stats?.totalReservations || 0,
      icon: Calendar,
      description: "Toutes les réservations",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "GMV mensuel",
      value: formatCurrency(stats?.stats?.monthlyGMV || 0),
      icon: Euro,
      description: "Revenus du mois",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Taux d'annulation",
      value: `${stats?.stats?.cancellationRate || 0}%`,
      icon: TrendingUp,
      description: `${stats?.stats?.cancelledCount || 0} annulations`,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Expériences populaires",
      value: stats?.topExperiences?.length || 0,
      icon: BarChart3,
      description: "Expériences actives",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de votre plateforme Golden Moments
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

        {/* Top Expériences */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expériences</CardTitle>
            <CardDescription>
              Les expériences les plus réservées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topExperiences && stats.topExperiences.length > 0 ? (
              <div className="space-y-4">
                {stats.topExperiences.slice(0, 5).map((item: any) => (
                  <div
                    key={item.experience.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {item.experience.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.experience.company || "Non spécifié"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {item.bookingCount} réservations
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.totalRevenue || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
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
                href="/admin/reservations"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Réservations</p>
                  <p className="text-sm text-muted-foreground">Gérer les réservations</p>
                </div>
              </a>
              <a
                href="/admin/experiences"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Expériences</p>
                  <p className="text-sm text-muted-foreground">Gérer les expériences</p>
                </div>
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Utilisateurs</p>
                  <p className="text-sm text-muted-foreground">Gérer les utilisateurs</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
