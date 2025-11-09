# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential Commands:**
```bash
pnpm dev          # Start development server (uses tsx watch)
pnpm build        # Build production bundle (Vite + esbuild)
pnpm start        # Run production server
pnpm check        # TypeScript type checking
pnpm format       # Format code with Prettier
pnpm test         # Run tests with Vitest
```

## Architecture Overview

### Tech Stack
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Wouter (routing)
- **Backend:** Express 4 + tRPC 11 + SuperJSON
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth
- **UI:** shadcn/ui components + Radix UI primitives

### Project Structure
```
golden-moments-backoffice-manus/
├── client/src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AdminLayout.tsx
│   │   └── PartnerLayout.tsx
│   ├── pages/              # Route pages (admin/, partner/)
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── hooks/              # Custom React hooks
│   └── lib/
│       ├── trpc.ts         # tRPC client setup
│       └── supabase.ts     # Supabase client
├── server/
│   ├── _core/
│   │   ├── index.ts        # Server entry point
│   │   ├── trpc.ts         # tRPC setup
│   │   ├── supabaseContext.ts  # tRPC context
│   │   └── vite.ts         # Vite dev server integration
│   ├── supabaseRouters.ts  # Main tRPC router
│   ├── db.ts               # Database helper functions
│   └── supabase.ts         # Supabase admin client
└── shared/
    ├── types.ts            # Shared TypeScript types
    └── const.ts            # Shared constants
```

### Path Aliases
```typescript
"@/*"        → "./client/src/*"
"@shared/*"  → "./shared/*"
"@assets"    → "./attached_assets"
```

## Critical Architecture Patterns

### Authentication Flow (Supabase)
1. Client signs in via `SupabaseAuthContext`
2. Session token stored by Supabase client
3. Token sent in `Authorization` header on each tRPC request
4. Server validates token with `supabaseAdmin.auth.getUser()`
5. User context attached to tRPC procedures

### tRPC Middleware Pattern
The server uses role-based middleware to enforce permissions:

```typescript
// Protected procedure validates Supabase token
const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.replace("Bearer ", "");
  const { data } = await supabaseAdmin.auth.getUser(token);
  if (!data.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: { authId: data.user.id } } });
});

// Admin procedure ensures user is an admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const admin = await db.getAdminByAuthId(ctx.user.authId);
  if (!admin) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, admin } });
});

// Partner procedure ensures user is a hotel partner
const hotelPartnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const partner = await db.getHotelPartnerByAuthId(ctx.user.authId);
  if (!partner) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, partner } });
});
```

### Router Organization
```typescript
appRouter = {
  system: systemRouter,
  auth: { me, logout, checkRole },
  admin: {
    stats,
    users: { list, search, delete },
    reservations: { list, search, getById, cancel, update },
    experiences: { list, getById, create, update, delete },
    partners: { list, create, update }
  },
  partner: {
    experiences: { list, getById, update },
    reservations: { list, getById },
    revenue
  }
}
```

### Data Access Pattern
1. Component calls tRPC hook: `trpc.admin.experiences.list.useQuery()`
2. Request sent to `/api/trpc` with Supabase token in header
3. Server validates token, applies role-based middleware
4. Helper function in `server/db.ts` queries Supabase database
5. Response serialized with SuperJSON, React Query caches result

### Row Level Security Pattern
- **Admin:** Full access to all data
- **Partner:** Filtered by `company` field (via helper functions like `getExperiencesForPartner()`)
- Validation in tRPC procedures ensures partners only access their own data

## Role & Permission System

### Roles
- **Admin roles:** super_admin, admin, moderator
- **Partner status:** active, inactive, pending
- **User:** Basic user role

### Permission Matrix
| Feature | Admin | Hotel Partner |
|---------|-------|---------------|
| View all reservations | ✅ | ❌ (own only) |
| Cancel reservations | ✅ | ❌ |
| Create experiences | ✅ | ❌ |
| Edit price/availability | ✅ | ✅ (own) |
| Edit title/description | ✅ | ❌ |
| Manage users | ✅ | ❌ |
| View global analytics | ✅ | ❌ (own revenue only) |

## Database Schema (Supabase)

### Key Tables
- `users` - Client users (links to auth.users via auth_id)
- `admins` - Backoffice administrators
- `hotel_partners` - Hotel partners
- `experiences` - Hotel experiences/offers
- `reservations` - User bookings
- `wishlists` - User saved experiences

All tables use `auth_id UUID` referencing `auth.users(id)`.

### Important Conventions
- **Prices:** Stored in centimes/cents (integer). Divide by 100 for display.
- **JSON fields:** Many fields store JSON as TEXT/JSONB (e.g., preferences, permissions, location, items, schedules)
- **Timestamps:** Use `created_at` and `updated_at` consistently

## Environment Variables

```bash
# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Frontend (client-side)
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
```

## Development Workflow

### Making Database Changes
1. Update schema in Supabase dashboard (SQL editor or Table editor)
2. Update helper functions in `server/db.ts`
3. Update tRPC procedures in `server/supabaseRouters.ts`

### Adding New Features
1. Create tRPC procedures in `server/supabaseRouters.ts` with appropriate middleware
2. Add database helper functions in `server/db.ts` if needed
3. Create UI components in `client/src/components/`
4. Create pages in `client/src/pages/admin/` or `client/src/pages/partner/`
5. Add routes in `client/src/App.tsx`

### Frontend Routing
- Uses Wouter (lightweight React Router alternative)
- Protected routes check user role via `SupabaseAuthContext`
- Layouts wrap role-specific pages (`AdminLayout`, `PartnerLayout`)

## Special Configuration

### Server Configuration
- Dynamic port allocation (starts at 3000, finds available)
- 50MB request size limit (supports file uploads)
- Development: Vite dev server integration for HMR
- Production: Static file serving from `dist/public`

### Notable Dependencies
- `wouter` - Has custom patch (`patches/wouter@3.7.1.patch`)
- `superjson` - Handles Date/Map/Set serialization over tRPC
- `jose` - JWT handling (pinned to v6.1.0)
- `@aws-sdk/client-s3` - File uploads to S3

### TypeScript Configuration
- Module: ESNext with bundler resolution
- Strict mode enabled
- No emit (Vite handles bundling)
- Allows importing .ts extensions

## Key Files to Understand

- `server/_core/index.ts` - Server entry point with port allocation and middleware
- `server/_core/vite.ts` - Vite dev server integration
- `server/supabaseRouters.ts` - Main tRPC router with all procedures
- `server/db.ts` - Database helper functions using Supabase client
- `client/src/lib/trpc.ts` - tRPC client configuration
- `client/src/contexts/SupabaseAuthContext.tsx` - Auth state management
- `client/src/App.tsx` - Main routing configuration
