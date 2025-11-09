import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { supabaseAdmin } from "../supabase";

/**
 * Crée le contexte pour chaque requête tRPC avec Supabase Auth
 */
export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Récupérer le token d'authentification depuis les headers
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  let user = null;

  if (token) {
    try {
      // Vérifier le token avec Supabase
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (!error && supabaseUser) {
        user = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          authId: supabaseUser.id
        };
      }
    } catch (error) {
      console.error('[Auth] Error verifying token:', error);
    }
  }

  return {
    req,
    res,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
