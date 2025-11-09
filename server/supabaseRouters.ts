import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure, hotelPartnerProcedure } from "./_core/supabaseTrpc";
import * as db from "./db";

export const appRouter = router({
  // Routes d'authentification
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    
    checkRole: protectedProcedure.query(async ({ ctx }) => {
      const admin = await db.getAdminByAuthId(ctx.user.authId);
      const partner = await db.getHotelPartnerByAuthId(ctx.user.authId);
      
      return {
        isAdmin: !!admin,
        isPartner: !!partner,
        admin,
        partner,
      };
    }),
  }),

  // Routes Admin
  admin: router({
    // Statistiques
    stats: adminProcedure.query(async () => {
      const stats = await db.getReservationStats();
      const topExperiences = await db.getTopExperiences(10);
      
      return {
        stats,
        topExperiences,
      };
    }),

    // Gestion des réservations
    reservations: router({
      list: adminProcedure.query(async () => {
        return db.getAllReservations();
      }),
      
      search: adminProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ input }) => {
          return db.searchReservations(input.query);
        }),
      
      cancel: adminProcedure
        .input(z.object({
          id: z.number(),
          reason: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
          await db.cancelReservation(input.id, input.reason, ctx.admin.id);
          return { success: true };
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.any(),
        }))
        .mutation(async ({ input }) => {
          await db.updateReservation(input.id, input.updates);
          return { success: true };
        }),
    }),

    // Gestion des expériences
    experiences: router({
      list: adminProcedure.query(async () => {
        return db.getAllExperiences();
      }),
      
      create: adminProcedure
        .input(z.any())
        .mutation(async ({ input, ctx }) => {
          const experience = await db.createExperience({
            ...input,
            created_by: ctx.admin.id,
          });
          return experience;
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.any(),
        }))
        .mutation(async ({ input, ctx }) => {
          await db.updateExperience(input.id, {
            ...input.updates,
            last_modified_by: ctx.admin.id,
          });
          return { success: true };
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteExperience(input.id);
          return { success: true };
        }),
      
      bulkDeactivateExpired: adminProcedure.mutation(async () => {
        await db.bulkDeactivateExpiredExperiences();
        return { success: true };
      }),
    }),

    // Gestion des utilisateurs
    users: router({
      list: adminProcedure.query(async () => {
        return db.getAllUsers();
      }),
      
      search: adminProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ input }) => {
          return db.searchUsers(input.query);
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteUser(input.id);
          return { success: true };
        }),
    }),

    // Gestion des partenaires
    partners: router({
      list: adminProcedure.query(async () => {
        return db.getAllHotelPartners();
      }),
      
      create: adminProcedure
        .input(z.any())
        .mutation(async ({ input }) => {
          const partner = await db.createHotelPartner(input);
          return partner;
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.any(),
        }))
        .mutation(async ({ input }) => {
          await db.updateHotelPartner(input.id, input.updates);
          return { success: true };
        }),
    }),
  }),

  // Routes Partenaire Hôtelier
  partner: router({
    // Revenus
    revenue: hotelPartnerProcedure.query(async ({ ctx }) => {
      return db.getHotelRevenue(ctx.partner.company);
    }),

    // Expériences
    experiences: router({
      list: hotelPartnerProcedure.query(async ({ ctx }) => {
        return db.getExperiencesByCompany(ctx.partner.company);
      }),
      
      update: hotelPartnerProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            price: z.number().optional(),
            date_start: z.string().optional(),
            date_end: z.string().optional(),
            is_active: z.boolean().optional(),
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          // Vérifier que l'expérience appartient au partenaire
          const experience = await db.getExperienceById(input.id);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          
          await db.updateExperience(input.id, {
            ...input.updates,
            last_modified_by: ctx.partner.id,
          });
          return { success: true };
        }),
    }),

    // Réservations
    reservations: router({
      list: hotelPartnerProcedure.query(async ({ ctx }) => {
        return db.getReservationsByCompany(ctx.partner.company);
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
