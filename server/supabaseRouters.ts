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
    // NOTE: Reservation creation with night validation and pricing
    // When creating reservations, use these helper functions from db.ts:
    // - validateNightSelection(experienceId, nights) - Validates nights against experience.allowed_nights
    // - calculateReservationPrice(params) - Calculates total price with breakdown from availability_periods
    // - calculateNights(checkInDate, checkOutDate) - Helper to calculate night count
    // The reservation should include: room_type_id, nights, price_breakdown, total_price
    reservations: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortColumn: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        }))
        .query(async ({ input }) => {
          return db.getReservationsPaginated(input);
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
          await db.cancelReservation(input.id, input.reason, ctx.user.authId);
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
      
      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          await db.deleteReservation(input.id);
          return { success: true };
        }),
      
      stats: adminProcedure
        .query(async () => {
          return db.getReservationStats();
        }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.string(),
          status: z.enum(['confirmed', 'completed', 'cancelled']),
          reason: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (input.status === 'cancelled' && input.reason) {
            await db.cancelReservation(input.id as any, input.reason, ctx.user.authId);
          } else {
            await db.updateReservation(input.id as any, { status: input.status });
          }
          return { success: true };
        }),
      
      // Comprehensive update for status, payment, notes
      updateReservation: adminProcedure
        .input(z.object({
          id: z.string(),
          status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
          paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
          adminNotes: z.string().optional(),
          cancellationReason: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updates: any = {};
          
          // Handle status update (including cancellation)
          if (input.status) {
            if (input.status === 'cancelled' && input.cancellationReason) {
              await db.cancelReservation(input.id as any, input.cancellationReason, ctx.user.authId);
              // Cancellation handled, don't update status again below
            } else if (input.status === 'cancelled' && !input.cancellationReason) {
              throw new Error('Cancellation reason is required when cancelling a reservation');
            } else {
              updates.status = input.status;
            }
          }
          
          // Handle payment status update
          if (input.paymentStatus !== undefined) {
            updates.payment_status = input.paymentStatus;
          }
          
          // Handle admin notes update
          if (input.adminNotes !== undefined) {
            updates.admin_notes = input.adminNotes;
          }
          
          // Apply updates if any (skip if already cancelled above)
          if (Object.keys(updates).length > 0 && input.status !== 'cancelled') {
            await db.updateReservation(input.id as any, updates);
          }
          
          return { success: true };
        }),
    }),

    // Gestion des expériences
    experiences: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortColumn: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        }))
        .query(async ({ input }) => {
          return db.getExperiencesPaginated(input);
        }),

      create: adminProcedure
        .input(z.any())
        .mutation(async ({ input, ctx }) => {
          // Validate allowed_nights if provided
          if (input.allowed_nights) {
            if (!Array.isArray(input.allowed_nights) || input.allowed_nights.length === 0) {
              throw new Error('allowed_nights must be a non-empty array');
            }
            if (!input.allowed_nights.every((n: number) => Number.isInteger(n) && n > 0 && n <= 30)) {
              throw new Error('allowed_nights must contain positive integers between 1 and 30');
            }
          }

          const experience = await db.createExperience({
            ...input,
            allowed_nights: input.allowed_nights || [1, 2, 3], // Default: flexible booking
            created_by: ctx.user.authId,
            last_modified_by: ctx.user.authId,
          });
          return experience;
        }),

      update: adminProcedure
        .input(z.object({
          id: z.string(),
          updates: z.any(),
        }))
        .mutation(async ({ input, ctx }) => {
          // Validate allowed_nights if being updated
          if (input.updates.allowed_nights) {
            if (!Array.isArray(input.updates.allowed_nights) || input.updates.allowed_nights.length === 0) {
              throw new Error('allowed_nights must be a non-empty array');
            }
            if (!input.updates.allowed_nights.every((n: number) => Number.isInteger(n) && n > 0 && n <= 30)) {
              throw new Error('allowed_nights must contain positive integers between 1 and 30');
            }
          }

          await db.updateExperience(input.id, {
            ...input.updates,
            last_modified_by: ctx.user.authId,
          });
          return { success: true };
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.string() }))
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
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortColumn: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        }))
        .query(async ({ input }) => {
          return db.getUsersPaginated(input);
        }),
      
      search: adminProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ input }) => {
          return db.searchUsers(input.query);
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          await db.deleteUser(input.id);
          return { success: true };
        }),
    }),

    // Gestion des partenaires
    partners: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortColumn: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        }))
        .query(async ({ input }) => {
          return db.getHotelPartnersPaginated(input);
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
      
      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          await db.deleteHotelPartner(input.id);
          return { success: true };
        }),
    }),

    // Room Types - Admin can manage all room types
    roomTypes: router({
      list: adminProcedure
        .input(z.object({
          experienceId: z.string(),
        }))
        .query(async ({ input }) => {
          return db.getRoomTypesByExperience(input.experienceId);
        }),

      create: adminProcedure
        .input(z.object({
          experience_id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          base_capacity: z.number().default(2),
          max_capacity: z.number().default(4),
          amenities: z.any().default({}),
          images: z.array(z.string()).default([]),
        }))
        .mutation(async ({ input }) => {
          return db.createRoomType(input);
        }),

      update: adminProcedure
        .input(z.object({
          id: z.string(),
          updates: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            base_capacity: z.number().optional(),
            max_capacity: z.number().optional(),
            amenities: z.any().optional(),
            images: z.array(z.string()).optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          return db.updateRoomType(input.id, input.updates);
        }),

      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          return db.deleteRoomType(input.id);
        }),
    }),

    // Availability Management - Admin can manage all availability
    availability: router({
      getByExperience: adminProcedure
        .input(z.object({
          experienceId: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          roomTypeId: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return db.getAvailabilityByDateRange(
            input.experienceId,
            input.startDate,
            input.endDate,
            input.roomTypeId
          );
        }),

      getSummary: adminProcedure
        .input(z.object({
          experienceId: z.string(),
          month: z.number().min(1).max(12),
          year: z.number(),
        }))
        .query(async ({ input }) => {
          return db.getAvailabilitySummary(
            input.experienceId,
            input.month,
            input.year
          );
        }),

      bulkUpsert: adminProcedure
        .input(z.object({
          periods: z.array(z.object({
            id: z.string().optional(),
            experience_id: z.string(),
            room_type_id: z.string(),
            date: z.string(),
            price: z.number(),
            original_price: z.number(),
            available_rooms: z.number(),
            is_available: z.boolean(),
          })),
        }))
        .mutation(async ({ input }) => {
          return db.upsertAvailabilityPeriods(input.periods);
        }),

      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          return db.deleteAvailabilityPeriod(input.id);
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
      list: hotelPartnerProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortColumn: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        }))
        .query(async ({ ctx, input }) => {
          return db.getExperiencesByCompanyPaginated(ctx.partner.company, input);
        }),
      
      create: hotelPartnerProcedure
        .input(z.any())
        .mutation(async ({ input, ctx }) => {
          // Partners can only create experiences as inactive
          const experience = await db.createExperience({
            ...input,
            status: 'inactive', // Force status to inactive for partners
            company: ctx.partner.company,
            created_by: ctx.user.authId,
            last_modified_by: ctx.user.authId,
          });
          return experience;
        }),
      
      update: hotelPartnerProcedure
        .input(z.object({
          id: z.string(),
          updates: z.object({
            price: z.number().optional(),
            date_start: z.string().optional(),
            date_end: z.string().optional(),
            // Partners cannot change status - removed is_active from allowed fields
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          // Vérifier que l'expérience appartient au partenaire
          const experience = await db.getExperienceById(input.id);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          
          // Partners cannot modify active experiences
          if (experience.status === 'active') {
            throw new Error("Les expériences actives ne peuvent pas être modifiées. Veuillez contacter l'équipe Golden Moments.");
          }
          
          // Remove status from updates if present (partners shouldn't be able to change it)
          const { status, ...safeUpdates } = input.updates as any;
          
          await db.updateExperience(input.id, {
            ...safeUpdates,
            last_modified_by: ctx.user.authId,
          });
          return { success: true };
        }),
      
      delete: hotelPartnerProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          // Vérifier que l'expérience appartient au partenaire
          const experience = await db.getExperienceById(input.id);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          
          await db.deleteExperience(input.id);
          return { success: true };
        }),
    }),

    // Réservations
    reservations: router({
      list: hotelPartnerProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortColumn: z.string().optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
        }))
        .query(async ({ ctx, input }) => {
          return db.getReservationsByCompanyPaginated(ctx.partner.company, input);
        }),
      
      stats: hotelPartnerProcedure
        .query(async ({ ctx }) => {
          return db.getPartnerReservationStats(ctx.partner.company);
        }),
    }),

    // Room Types
    roomTypes: router({
      list: hotelPartnerProcedure
        .input(z.object({
          experienceId: z.string(),
        }))
        .query(async ({ input, ctx }) => {
          // Verify experience belongs to partner
          const experience = await db.getExperienceById(input.experienceId);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          return db.getRoomTypesByExperience(input.experienceId);
        }),

      create: hotelPartnerProcedure
        .input(z.object({
          experience_id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          base_capacity: z.number().default(2),
          max_capacity: z.number().default(4),
          amenities: z.any().default({}),
          images: z.array(z.string()).default([]),
        }))
        .mutation(async ({ input, ctx }) => {
          // Verify experience belongs to partner
          const experience = await db.getExperienceById(input.experience_id);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          return db.createRoomType(input);
        }),

      update: hotelPartnerProcedure
        .input(z.object({
          id: z.string(),
          updates: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            base_capacity: z.number().optional(),
            max_capacity: z.number().optional(),
            amenities: z.any().optional(),
            images: z.array(z.string()).optional(),
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          // Verify room type's experience belongs to partner
          const roomType = await db.getRoomTypeById(input.id);
          if (!roomType) {
            throw new Error("Type de chambre non trouvé");
          }
          const experience = await db.getExperienceById(roomType.experienceId);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Accès refusé");
          }
          return db.updateRoomType(input.id, input.updates);
        }),

      delete: hotelPartnerProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          // Verify room type's experience belongs to partner
          const roomType = await db.getRoomTypeById(input.id);
          if (!roomType) {
            throw new Error("Type de chambre non trouvé");
          }
          const experience = await db.getExperienceById(roomType.experienceId);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Accès refusé");
          }
          return db.deleteRoomType(input.id);
        }),
    }),

    // Availability Management
    availability: router({
      getByExperience: hotelPartnerProcedure
        .input(z.object({
          experienceId: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          roomTypeId: z.string().optional(),
        }))
        .query(async ({ input, ctx }) => {
          // Verify experience belongs to partner
          const experience = await db.getExperienceById(input.experienceId);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          return db.getAvailabilityByDateRange(
            input.experienceId,
            input.startDate,
            input.endDate,
            input.roomTypeId
          );
        }),

      getSummary: hotelPartnerProcedure
        .input(z.object({
          experienceId: z.string(),
          month: z.number().min(1).max(12),
          year: z.number(),
        }))
        .query(async ({ input, ctx }) => {
          // Verify experience belongs to partner
          const experience = await db.getExperienceById(input.experienceId);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Expérience non trouvée ou accès refusé");
          }
          return db.getAvailabilitySummary(
            input.experienceId,
            input.month,
            input.year
          );
        }),

      bulkUpsert: hotelPartnerProcedure
        .input(z.object({
          periods: z.array(z.object({
            id: z.string().optional(),
            experience_id: z.string(),
            room_type_id: z.string(),
            date: z.string(),
            price: z.number(),
            original_price: z.number(),
            available_rooms: z.number(),
            is_available: z.boolean(),
          })),
        }))
        .mutation(async ({ input, ctx }) => {
          // Comprehensive ownership validation for each period
          for (const period of input.periods) {
            // 1. Validate experience ownership
            const experience = await db.getExperienceById(period.experience_id);
            if (!experience || experience.company !== ctx.partner.company) {
              throw new Error("Expérience non trouvée ou accès refusé");
            }

            // 2. Validate room type belongs to the experience
            const roomType = await db.getRoomTypeById(period.room_type_id);
            if (!roomType) {
              throw new Error("Type de chambre non trouvé");
            }
            if (roomType.experienceId !== period.experience_id) {
              throw new Error("Type de chambre invalide pour cette expérience");
            }

            // 3. If updating existing period, validate ownership
            if (period.id) {
              const existingPeriod = await db.getAvailabilityPeriodById(period.id);
              if (!existingPeriod) {
                throw new Error("Période de disponibilité non trouvée");
              }
              if (existingPeriod.experience_id !== period.experience_id) {
                throw new Error("Accès refusé");
              }
            }
          }

          return db.upsertAvailabilityPeriods(input.periods);
        }),

      delete: hotelPartnerProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          // Verify ownership before deletion
          const period = await db.getAvailabilityPeriodById(input.id);
          if (!period) {
            throw new Error("Période de disponibilité non trouvée");
          }

          // Verify the period's experience belongs to partner
          const experience = await db.getExperienceById(period.experience_id);
          if (!experience || experience.company !== ctx.partner.company) {
            throw new Error("Accès refusé");
          }

          return db.deleteAvailabilityPeriod(input.id);
        }),
    }),
  }),

  // Public routes (for mobile app)
  public: router({
    // Room Types
    roomTypes: router({
      getByExperience: publicProcedure
        .input(z.object({
          experienceId: z.string(),
        }))
        .query(async ({ input }) => {
          return db.getRoomTypesByExperience(input.experienceId);
        }),
    }),

    // Availability (only available dates)
    availability: router({
      getByExperience: publicProcedure
        .input(z.object({
          experienceId: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          roomTypeId: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return db.getAvailabilityByDateRange(
            input.experienceId,
            input.startDate,
            input.endDate,
            input.roomTypeId
          );
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
