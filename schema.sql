-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'admin'::text CHECK (role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'moderator'::text])),
  permissions jsonb DEFAULT '["read"]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text NOT NULL UNIQUE,
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  price numeric NOT NULL,
  images ARRAY NOT NULL,
  category text NOT NULL,
  location jsonb NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  review_count integer DEFAULT 0,
  items jsonb DEFAULT '{}'::jsonb,
  check_in_info jsonb DEFAULT '{}'::jsonb,
  transportation jsonb DEFAULT '{}'::jsonb,
  accessibility jsonb DEFAULT '{}'::jsonb,
  additional_info jsonb DEFAULT '{}'::jsonb,
  schedules jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  date_start timestamp with time zone,
  date_end timestamp with time zone,
  company text,
  image_url text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_by uuid,
  last_modified_by uuid,
  partner_id uuid,
  CONSTRAINT experiences_pkey PRIMARY KEY (id),
  CONSTRAINT experiences_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT experiences_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES auth.users(id),
  CONSTRAINT experiences_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.hotel_partners(id)
);
CREATE TABLE public.hotel_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  hotel_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL UNIQUE,
  contact_phone text,
  address jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])),
  commission_rate numeric DEFAULT 15.00 CHECK (commission_rate >= 0::numeric AND commission_rate <= 100::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  company text,
  CONSTRAINT hotel_partners_pkey PRIMARY KEY (id),
  CONSTRAINT hotel_partners_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['booking'::text, 'payment'::text, 'review'::text, 'system'::text, 'marketing'::text])),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reservation_id uuid,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  currency text NOT NULL DEFAULT 'EUR'::text,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['card'::text, 'bank_transfer'::text, 'paypal'::text, 'other'::text])),
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
  transaction_id text UNIQUE,
  payment_provider text,
  provider_response jsonb DEFAULT '{}'::jsonb,
  refund_amount numeric DEFAULT 0 CHECK (refund_amount >= 0::numeric),
  refund_reason text,
  refunded_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id)
);
CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  experience_id uuid,
  booking_reference text NOT NULL UNIQUE,
  check_in_date timestamp with time zone NOT NULL,
  check_out_date timestamp with time zone NOT NULL,
  room_type text NOT NULL,
  guest_count integer NOT NULL DEFAULT 2 CHECK (guest_count > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0::numeric),
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'completed'::text])),
  payment_status text NOT NULL DEFAULT 'paid'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text, 'failed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  admin_notes text,
  cancellation_reason text,
  cancelled_by uuid,
  cancelled_at timestamp with time zone,
  CONSTRAINT reservations_pkey PRIMARY KEY (id),
  CONSTRAINT reservations_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id),
  CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT reservations_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  experience_id uuid,
  user_id uuid,
  reservation_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT true,
  admin_response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT reviews_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text,
  email text NOT NULL UNIQUE,
  phone_number text,
  profile_picture text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  auth_id text NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT waitlist_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  experience_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.experiences(id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);