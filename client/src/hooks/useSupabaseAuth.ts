import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook d'authentification compatible avec l'ancienne API useAuth
 * mais utilisant Supabase en arrière-plan
 */
export function useAuth() {
  const { user, session, loading, signOut } = useSupabaseAuth();

  return {
    user: user ? {
      id: user.id,
      authId: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email,
    } : null,
    loading,
    isAuthenticated: !!user,
    error: null,
    logout: signOut,
  };
}
