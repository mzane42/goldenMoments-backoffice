# Guide de Migration vers Supabase

Ce guide vous explique comment migrer complètement le backoffice Golden Moments vers Supabase.

## 📋 Prérequis

1. Un projet Supabase actif
2. Les clés d'API Supabase (déjà configurées)
3. Accès à l'éditeur SQL de Supabase

## 🗄️ Étape 1 : Créer le Schéma de Base de Données

### 1.1 Accéder à l'éditeur SQL

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête

### 1.2 Exécuter le script SQL

Copiez et exécutez le script suivant dans l'éditeur SQL :

```sql
-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email VARCHAR(320),
  phone_number VARCHAR(20),
  profile_picture TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: admins
-- =====================================================
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');

CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  role admin_role DEFAULT 'admin',
  permissions JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admins_auth_id ON admins(auth_id);
CREATE INDEX idx_admins_email ON admins(email);

CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: hotel_partners
-- =====================================================
CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'pending');

CREATE TABLE IF NOT EXISTS hotel_partners (
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  status partner_status DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hotel_partners_auth_id ON hotel_partners(auth_id);
CREATE INDEX idx_hotel_partners_company ON hotel_partners(company);

CREATE TRIGGER update_hotel_partners_updated_at
BEFORE UPDATE ON hotel_partners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: experiences
-- =====================================================
CREATE TABLE IF NOT EXISTS experiences (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL, -- Prix en centimes
  images TEXT NOT NULL, -- JSON array
  category TEXT NOT NULL,
  location JSONB,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  items JSONB, -- Amenities
  check_in_info JSONB,
  transportation JSONB,
  accessibility JSONB,
  additional_info JSONB,
  schedules JSONB,
  date_start TIMESTAMP WITH TIME ZONE,
  date_end TIMESTAMP WITH TIME ZONE,
  company TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT REFERENCES admins(id),
  last_modified_by BIGINT,
  max_capacity INTEGER DEFAULT 10,
  min_capacity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_experiences_company ON experiences(company);
CREATE INDEX idx_experiences_category ON experiences(category);
CREATE INDEX idx_experiences_is_active ON experiences(is_active);
CREATE INDEX idx_experiences_dates ON experiences(date_start, date_end);

CREATE TRIGGER update_experiences_updated_at
BEFORE UPDATE ON experiences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: reservations
-- =====================================================
CREATE TYPE reservation_status AS ENUM ('confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  check_in_date TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_date TIMESTAMP WITH TIME ZONE NOT NULL,
  room_type TEXT NOT NULL,
  guest_count INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL, -- Prix en centimes
  status reservation_status DEFAULT 'confirmed',
  payment_status payment_status DEFAULT 'pending',
  admin_notes TEXT,
  cancellation_reason TEXT,
  cancelled_by BIGINT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_experience_id ON reservations(experience_id);
CREATE INDEX idx_reservations_booking_reference ON reservations(booking_reference);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: wishlists
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, experience_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_experience_id ON wishlists(experience_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Politiques pour admins
CREATE POLICY "Admins can view all data"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_id = auth.uid() AND is_active = TRUE
    )
  );

-- Politiques pour hotel_partners
CREATE POLICY "Partners can view their own data"
  ON hotel_partners FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Partners can update their own data"
  ON hotel_partners FOR UPDATE
  USING (auth.uid() = auth_id);

-- Politiques pour experiences
CREATE POLICY "Anyone can view active experiences"
  ON experiences FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Partners can view their own experiences"
  ON experiences FOR SELECT
  USING (
    company IN (
      SELECT company FROM hotel_partners
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Partners can update their own experiences"
  ON experiences FOR UPDATE
  USING (
    company IN (
      SELECT company FROM hotel_partners
      WHERE auth_id = auth.uid()
    )
  );

-- Politiques pour reservations
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Partners can view reservations for their experiences"
  ON reservations FOR SELECT
  USING (
    experience_id IN (
      SELECT id FROM experiences
      WHERE company IN (
        SELECT company FROM hotel_partners
        WHERE auth_id = auth.uid()
      )
    )
  );

-- Politiques pour wishlists
CREATE POLICY "Users can manage their own wishlists"
  ON wishlists FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
    )
  );

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour créer automatiquement un utilisateur dans la table users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🔐 Étape 2 : Configurer l'Authentification Supabase

### 2.1 Activer les fournisseurs d'authentification

1. Dans votre projet Supabase, allez dans **Authentication** → **Providers**
2. Activez les fournisseurs souhaités :
   - **Email** (recommandé pour le backoffice)
   - **Google** (optionnel)
   - **GitHub** (optionnel)

### 2.2 Configurer les URLs de redirection

1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez votre URL de production dans **Site URL**
3. Ajoutez les URLs de redirection autorisées

## 👤 Étape 3 : Créer les Comptes Administrateurs et Partenaires

### 3.1 Créer un compte admin

1. Créez d'abord un utilisateur via Supabase Auth :
   - Allez dans **Authentication** → **Users**
   - Cliquez sur **Add user** → **Create new user**
   - Entrez l'email et le mot de passe

2. Récupérez l'UUID de l'utilisateur créé

3. Dans l'éditeur SQL, exécutez :

```sql
INSERT INTO admins (auth_id, full_name, email, role, is_active)
VALUES (
  'UUID_DE_LUTILISATEUR', -- Remplacez par l'UUID réel
  'Votre Nom',
  'admin@goldenmoments.com',
  'super_admin',
  TRUE
);
```

### 3.2 Créer un compte partenaire

1. Créez l'utilisateur via Supabase Auth (même procédure)

2. Dans l'éditeur SQL :

```sql
INSERT INTO hotel_partners (auth_id, hotel_name, company, contact_name, email, status)
VALUES (
  'UUID_DE_LUTILISATEUR', -- Remplacez par l'UUID réel
  'Hôtel Plaza',
  'Plaza Athénée Paris',
  'Jean Dupont',
  'contact@plaza.com',
  'active'
);
```

## 🔧 Étape 4 : Mettre à Jour les Variables d'Environnement

Les variables Supabase sont déjà configurées, mais vous devez également ajouter les variables frontend :

1. Allez dans **Settings** → **Secrets** dans l'interface Manus
2. Ajoutez :
   - `VITE_SUPABASE_URL` : https://zwnsbeyeikhuvkiqccep.supabase.co
   - `VITE_SUPABASE_ANON_KEY` : votre clé anon

## 🚀 Étape 5 : Tester l'Authentification

1. Redémarrez le serveur de développement
2. Accédez à la page d'accueil
3. Essayez de vous connecter avec un compte admin ou partenaire
4. Vérifiez que vous êtes redirigé vers le bon dashboard

## 📊 Étape 6 : Importer les Données Existantes (Optionnel)

Si vous avez déjà des données dans votre ancienne base de données, vous pouvez les importer :

### 6.1 Exporter depuis l'ancienne base

```sql
-- Exporter les expériences
SELECT * FROM experiences;

-- Exporter les réservations
SELECT * FROM reservations;
```

### 6.2 Importer dans Supabase

Utilisez l'éditeur SQL de Supabase pour insérer les données :

```sql
INSERT INTO experiences (title, description, price, images, category, ...)
VALUES (...);
```

Ou utilisez l'outil d'import CSV de Supabase.

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Authentification** : Connectez-vous avec un compte admin et partenaire
2. **Permissions** : Vérifiez que les admins voient tout et les partenaires seulement leurs données
3. **RLS** : Essayez d'accéder à des données d'un autre partenaire (devrait échouer)
4. **CRUD** : Créez, modifiez et supprimez des données

## 🐛 Dépannage

### Erreur : "JWT expired"
- Reconnectez-vous, le token a expiré

### Erreur : "Row Level Security policy violation"
- Vérifiez que l'utilisateur a bien un enregistrement dans `admins` ou `hotel_partners`
- Vérifiez que `auth_id` correspond bien à l'UUID de l'utilisateur Supabase

### Les données ne s'affichent pas
- Vérifiez les politiques RLS
- Vérifiez que les données existent dans la base
- Consultez les logs Supabase dans **Logs** → **Postgres Logs**

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentation Supabase Client](https://supabase.com/docs/reference/javascript/introduction)

## 🔄 Prochaines Étapes

Après avoir terminé cette migration :

1. Testez toutes les fonctionnalités du backoffice
2. Configurez les notifications email via Supabase
3. Activez les logs et le monitoring
4. Configurez les sauvegardes automatiques
5. Déployez en production

---

**Note importante** : Cette migration remplace complètement le système d'authentification Manus OAuth par Supabase Auth. Assurez-vous que tous vos utilisateurs sont migrés avant de désactiver l'ancien système.
