import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * GOLDEN MOMENTS BACKOFFICE - SCHÉMA DE BASE DE DONNÉES
 * 
 * Tables principales:
 * - users: Utilisateurs de la plateforme (clients)
 * - admins: Administrateurs du backoffice
 * - hotel_partners: Partenaires hôteliers
 * - experiences: Expériences/offres hôtelières
 * - reservations: Réservations des utilisateurs
 * - wishlists: Listes de souhaits des utilisateurs
 */

// =====================================================
// TABLE USERS (Utilisateurs clients)
// =====================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  authId: varchar("authId", { length: 64 }).notNull().unique(),
  fullName: text("fullName"),
  email: varchar("email", { length: 320 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  profilePicture: text("profilePicture"),
  preferences: text("preferences"), // JSON stringifié
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// =====================================================
// TABLE ADMINS (Administrateurs du backoffice)
// =====================================================
export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  authId: varchar("authId", { length: 64 }).unique(),
  fullName: text("fullName").notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: mysqlEnum("role", ["super_admin", "admin", "moderator"]).default("admin").notNull(),
  permissions: text("permissions"), // JSON stringifié
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

// =====================================================
// TABLE HOTEL_PARTNERS (Partenaires hôteliers)
// =====================================================
export const hotelPartners = mysqlTable("hotelPartners", {
  id: int("id").autoincrement().primaryKey(),
  authId: varchar("authId", { length: 64 }).unique(),
  hotelName: text("hotelName").notNull(),
  company: text("company").notNull(), // Lien avec experiences.company
  contactName: text("contactName").notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"), // JSON stringifié
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("active").notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("15.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HotelPartner = typeof hotelPartners.$inferSelect;
export type InsertHotelPartner = typeof hotelPartners.$inferInsert;

// =====================================================
// TABLE EXPERIENCES (Expériences hôtelières)
// =====================================================
export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("longDescription"),
  price: int("price").notNull(), // Prix en centimes
  images: text("images").notNull(), // JSON array stringifié
  category: text("category").notNull(),
  location: text("location"), // JSON stringifié
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: int("reviewCount").default(0).notNull(),
  items: text("items"), // JSON stringifié (amenities)
  checkInInfo: text("checkInInfo"), // JSON stringifié
  transportation: text("transportation"), // JSON stringifié
  accessibility: text("accessibility"), // JSON stringifié
  additionalInfo: text("additionalInfo"), // JSON stringifié
  schedules: text("schedules"), // JSON stringifié
  dateStart: timestamp("dateStart"),
  dateEnd: timestamp("dateEnd"),
  company: text("company"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy"), // ID de l'admin ou du partenaire
  lastModifiedBy: int("lastModifiedBy"),
  maxCapacity: int("maxCapacity").default(10).notNull(),
  minCapacity: int("minCapacity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

// =====================================================
// TABLE WISHLISTS (Listes de souhaits)
// =====================================================
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  experienceId: int("experienceId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

// =====================================================
// TABLE RESERVATIONS (Réservations)
// =====================================================
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  experienceId: int("experienceId").notNull(),
  bookingReference: varchar("bookingReference", { length: 50 }).notNull().unique(),
  checkInDate: timestamp("checkInDate").notNull(),
  checkOutDate: timestamp("checkOutDate").notNull(),
  roomType: text("roomType").notNull(),
  guestCount: int("guestCount").default(2).notNull(),
  totalPrice: int("totalPrice").notNull(), // Prix en centimes
  status: mysqlEnum("status", ["confirmed", "cancelled", "completed"]).default("confirmed").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded", "failed"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  cancellationReason: text("cancellationReason"),
  cancelledBy: int("cancelledBy"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
