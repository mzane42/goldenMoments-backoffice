import { useAuth } from "@/hooks/useSupabaseAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/supabaseConst";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, signInWithGoogle } = useAuth();
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

              {/* Google OAuth Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>

              {/* Email Login Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Se connecter avec Email
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
              © 2025 Golden Moments. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
