import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./supabaseContext";
import * as db from "../db";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware pour vérifier qu'un utilisateur est connecté
const requireUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "Vous devez être connecté pour accéder à cette ressource" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// Middleware pour vérifier qu'un utilisateur est admin
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const admin = await db.getAdminByAuthId(ctx.user.authId);
  
  if (!admin) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Accès réservé aux administrateurs" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      admin,
    },
  });
});

// Middleware pour vérifier qu'un utilisateur est partenaire hôtelier
export const hotelPartnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const partner = await db.getHotelPartnerByAuthId(ctx.user.authId);
  
  if (!partner) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Accès réservé aux partenaires hôteliers" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      partner,
    },
  });
});
