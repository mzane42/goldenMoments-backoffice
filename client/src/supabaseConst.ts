/**
 * Fonction pour obtenir l'URL de connexion Supabase
 * Redirige vers la page de connexion Supabase Magic Link
 */
export const getLoginUrl = () => {
  // Pour Supabase, on redirige vers une page de login personnalisée
  // ou on utilise le composant Auth UI de Supabase
  return "/login";
};

/**
 * Get the base URL for redirects (OAuth, magic links, etc.)
 * Uses VITE_APP_URL environment variable if set, otherwise falls back to window.location.origin
 */
export const getRedirectUrl = (): string => {
  return import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
};

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Golden Moments";
export const APP_LOGO = "https://zwnsbeyeikhuvkiqccep.supabase.co/storage/v1/object/public/assets/logo/logo-solo.png";
