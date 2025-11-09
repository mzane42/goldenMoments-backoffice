import { useAuth } from "@/hooks/useSupabaseAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/supabaseConst";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: roleCheck, isLoading: roleLoading } = trpc.auth.checkRole.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!isAuthenticated) {
        // Pas connecté, rediriger vers login
        return;
      }

      if (roleCheck) {
        // Rediriger selon le rôle
        if (roleCheck.isAdmin) {
          setLocation("/admin");
        } else if (roleCheck.isPartner) {
          setLocation("/partner");
        }
      }
    }
  }, [loading, roleLoading, isAuthenticated, roleCheck, setLocation]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 text-center">
          {/* Logo */}
          {APP_LOGO && (
            <div className="mb-6">
              <img src={APP_LOGO} alt="Logo" className="h-16 w-16 mx-auto object-contain" />
            </div>
          )}

          {/* Titre */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {APP_TITLE}
          </h1>
          <p className="text-muted-foreground mb-8">
            Backoffice de gestion pour la marketplace d'expériences hôtelières
          </p>

          {/* Connexion */}
          {!isAuthenticated && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour accéder au backoffice
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Se connecter
              </Button>
            </div>
          )}

          {/* Utilisateur connecté mais sans rôle */}
          {isAuthenticated && roleCheck && !roleCheck.isAdmin && !roleCheck.isPartner && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium">
                  Accès non autorisé
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Votre compte n'a pas les permissions nécessaires pour accéder au backoffice.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecté en tant que : <strong>{user?.email}</strong>
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Se connecter avec un autre compte
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2024 Golden Moments. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
