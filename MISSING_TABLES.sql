-- ============================================
-- Script SQL pour les tables manquantes du backoffice Golden Moments
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- ============================================
-- 1. TABLE ADMINS
-- Gère les administrateurs du backoffice
-- ============================================

CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '["read"]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. TABLE HOTEL_PARTNERS
-- Gère les partenaires hôteliers
-- ============================================

CREATE TABLE IF NOT EXISTS public.hotel_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  hotel_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL UNIQUE,
  contact_phone text,
  address jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  commission_rate numeric(5,2) DEFAULT 15.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_hotel_partners_user_id ON public.hotel_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_partners_status ON public.hotel_partners(status);
CREATE INDEX IF NOT EXISTS idx_hotel_partners_email ON public.hotel_partners(contact_email);

-- Trigger
CREATE TRIGGER update_hotel_partners_updated_at
  BEFORE UPDATE ON public.hotel_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. TABLE REVIEWS
-- Avis clients sur les expériences
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT true,
  admin_response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_experience_id ON public.reviews(experience_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON public.reviews(is_published);

-- Trigger
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TABLE PAYMENTS
-- Transactions et paiements
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'paypal', 'other')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_id text UNIQUE,
  payment_provider text,
  provider_response jsonb DEFAULT '{}'::jsonb,
  refund_amount numeric DEFAULT 0 CHECK (refund_amount >= 0),
  refund_reason text,
  refunded_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- Trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. TABLE NOTIFICATIONS
-- Système de notifications
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('booking', 'payment', 'review', 'system', 'marketing')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- 6. AJOUT DE COLONNES MANQUANTES
-- Ajouter des colonnes aux tables existantes si nécessaire
-- ============================================

-- Ajouter created_by et last_modified_by à experiences si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'experiences' 
                 AND column_name = 'created_by') THEN
    ALTER TABLE public.experiences ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'experiences' 
                 AND column_name = 'last_modified_by') THEN
    ALTER TABLE public.experiences ADD COLUMN last_modified_by uuid REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'experiences' 
                 AND column_name = 'partner_id') THEN
    ALTER TABLE public.experiences ADD COLUMN partner_id uuid REFERENCES public.hotel_partners(id);
  END IF;
END $$;

-- Ajouter admin_notes, cancellation_reason, cancelled_by, cancelled_at à reservations si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'reservations' 
                 AND column_name = 'admin_notes') THEN
    ALTER TABLE public.reservations ADD COLUMN admin_notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'reservations' 
                 AND column_name = 'cancellation_reason') THEN
    ALTER TABLE public.reservations ADD COLUMN cancellation_reason text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'reservations' 
                 AND column_name = 'cancelled_by') THEN
    ALTER TABLE public.reservations ADD COLUMN cancelled_by uuid REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'reservations' 
                 AND column_name = 'cancelled_at') THEN
    ALTER TABLE public.reservations ADD COLUMN cancelled_at timestamp with time zone;
  END IF;
END $$;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- Politiques de sécurité pour chaque table
-- ============================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour admins : Les admins peuvent tout voir et modifier
CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Super admins can manage admins"
  ON public.admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

-- Politique pour hotel_partners : Les partenaires peuvent voir leurs propres données
CREATE POLICY "Partners can view own data"
  ON public.hotel_partners FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all partners"
  ON public.hotel_partners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage partners"
  ON public.hotel_partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politique pour reviews : Tout le monde peut lire les avis publiés
CREATE POLICY "Anyone can view published reviews"
  ON public.reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politique pour payments : Seuls les admins et les utilisateurs concernés peuvent voir
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reservations
      WHERE id = payments.reservation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politique pour notifications : Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================
-- 8. TRIGGER POUR CRÉER AUTOMATIQUEMENT LE PROFIL USER
-- Lorsqu'un utilisateur s'inscrit via Supabase Auth
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger s'il n'existe pas déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SCRIPT TERMINÉ
-- ============================================

-- Vérifier que toutes les tables ont été créées
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('admins', 'hotel_partners', 'reviews', 'payments', 'notifications')
ORDER BY table_name;
