import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// =====================================================
// MIDDLEWARE POUR LES RÔLES
// =====================================================

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const admin = await db.getAdminByAuthId(ctx.user.authId);
  
  if (!admin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux administrateurs",
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      admin,
    },
  });
});

const hotelPartnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const partner = await db.getHotelPartnerByAuthId(ctx.user.authId);
  
  if (!partner) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux partenaires hôteliers",
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      partner,
    },
  });
});

// =====================================================
// ROUTEURS
// =====================================================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    // Vérifier le rôle de l'utilisateur
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

  // =====================================================
  // ROUTES ADMIN
  // =====================================================
  admin: router({
    // Dashboard & Analytics
    stats: adminProcedure.query(async () => {
      const stats = await db.getReservationStats();
      const topExperiences = await db.getTopExperiences(10);
      
      return {
        stats,
        topExperiences,
      };
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
        .input(z.object({ userId: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteUser(input.userId);
          return { success: true };
        }),
    }),
    
    // Gestion des réservations
    reservations: router({
      list: adminProcedure.query(async () => {
        return db.getAllReservations();
      }),
      
      search: adminProcedure
        .input(z.object({ bookingRef: z.string() }))
        .query(async ({ input }) => {
          return db.searchReservations(input.bookingRef);
        }),
      
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return db.getReservationById(input.id);
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
          data: z.object({
            adminNotes: z.string().optional(),
            status: z.enum(["confirmed", "cancelled", "completed"]).optional(),
            paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          await db.updateReservation(input.id, input.data);
          return { success: true };
        }),
    }),
    
    // Gestion des expériences
    experiences: router({
      list: adminProcedure.query(async () => {
        return db.getAllExperiences();
      }),
      
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return db.getExperienceById(input.id);
        }),
      
      create: adminProcedure
        .input(z.object({
          title: z.string(),
          description: z.string(),
          longDescription: z.string().optional(),
          price: z.number(),
          images: z.string(), // JSON array
          category: z.string(),
          location: z.string().optional(),
          company: z.string().optional(),
          dateStart: z.date().optional(),
          dateEnd: z.date().optional(),
          maxCapacity: z.number().default(10),
          minCapacity: z.number().default(1),
        }))
        .mutation(async ({ input, ctx }) => {
          await db.createExperience({
            ...input,
            createdBy: ctx.admin.id,
            lastModifiedBy: ctx.admin.id,
          });
          return { success: true };
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            longDescription: z.string().optional(),
            price: z.number().optional(),
            images: z.string().optional(),
            category: z.string().optional(),
            location: z.string().optional(),
            company: z.string().optional(),
            dateStart: z.date().optional(),
            dateEnd: z.date().optional(),
            isActive: z.boolean().optional(),
            maxCapacity: z.number().optional(),
            minCapacity: z.number().optional(),
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          await db.updateExperience(input.id, {
            ...input.data,
            lastModifiedBy: ctx.admin.id,
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
    
    // Gestion des partenaires hôteliers
    partners: router({
      list: adminProcedure.query(async () => {
        return db.getAllHotelPartners();
      }),
      
      create: adminProcedure
        .input(z.object({
          authId: z.string().optional(),
          hotelName: z.string(),
          company: z.string(),
          contactName: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          address: z.string().optional(),
          commissionRate: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await db.createHotelPartner(input);
          return { success: true };
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            hotelName: z.string().optional(),
            company: z.string().optional(),
            contactName: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            status: z.enum(["active", "inactive", "pending"]).optional(),
            commissionRate: z.string().optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          await db.updateHotelPartner(input.id, input.data);
          return { success: true };
        }),
    }),
  }),

  // =====================================================
  // ROUTES PARTENAIRE HÔTEL
  // =====================================================
  partner: router({
    // Mes expériences
    experiences: router({
      list: hotelPartnerProcedure.query(async ({ ctx }) => {
        return db.getExperiencesByCompany(ctx.partner.company);
      }),
      
      getById: hotelPartnerProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
          const experience = await db.getExperienceById(input.id);
          
          // Vérifier que l'expérience appartient au partenaire
          if (experience && experience.company !== ctx.partner.company) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Accès non autorisé à cette expérience",
            });
          }
          
          return experience;
        }),
      
      // Mise à jour limitée (prix, disponibilité, statut seulement)
      update: hotelPartnerProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            price: z.number().optional(),
            dateStart: z.date().optional(),
            dateEnd: z.date().optional(),
            isActive: z.boolean().optional(),
            maxCapacity: z.number().optional(),
            minCapacity: z.number().optional(),
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          const experience = await db.getExperienceById(input.id);
          
          // Vérifier que l'expérience appartient au partenaire
          if (!experience || experience.company !== ctx.partner.company) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Accès non autorisé à cette expérience",
            });
          }
          
          await db.updateExperience(input.id, {
            ...input.data,
            lastModifiedBy: ctx.partner.id,
          });
          
          return { success: true };
        }),
    }),
    
    // Mes réservations
    reservations: router({
      list: hotelPartnerProcedure.query(async ({ ctx }) => {
        return db.getReservationsByCompany(ctx.partner.company);
      }),
      
      getById: hotelPartnerProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
          const reservation = await db.getReservationById(input.id);
          
          // Vérifier que la réservation appartient au partenaire
          if (reservation && reservation.experience?.company !== ctx.partner.company) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Accès non autorisé à cette réservation",
            });
          }
          
          return reservation;
        }),
    }),
    
    // Mes revenus
    revenue: hotelPartnerProcedure.query(async ({ ctx }) => {
      return db.getHotelRevenue(ctx.partner.company);
    }),
  }),
});

export type AppRouter = typeof appRouter;
