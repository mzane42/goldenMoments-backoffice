# Configuration Finale - Golden Moments Backoffice

## ✅ Ce qui a été fait

La migration vers Supabase est **presque complète**. Voici ce qui a été implémenté :

### Backend
- ✅ Client Supabase serveur (`server/supabase.ts`)
- ✅ Helpers de base de données Supabase (`server/db.ts`)
- ✅ Procédures tRPC avec authentification Supabase (`server/supabaseRouters.ts`)
- ✅ Contexte tRPC pour Supabase (`server/_core/supabaseContext.ts`)
- ✅ Correction des erreurs TypeScript (oauth.ts, sdk.ts)

### Frontend
- ✅ Client Supabase (`client/src/lib/supabase.ts`)
- ✅ Contexte d'authentification Supabase (`client/src/contexts/SupabaseAuthContext.tsx`)
- ✅ Hook useAuth compatible (`client/src/hooks/useSupabaseAuth.ts`)
- ✅ Page de connexion Supabase (`client/src/pages/Login.tsx`)
- ✅ Mise à jour de tous les composants (Home, AdminLayout, PartnerLayout)
- ✅ Configuration du client tRPC avec token Supabase

## ⚠️ Ce qu'il reste à faire

### 1. Ajouter les variables d'environnement frontend

**Dans l'interface Manus** (panneau de droite → Settings → Secrets), ajoutez :

```
VITE_SUPABASE_URL=https://zwnsbeyeikhuvkiqccep.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bnNiZXllaWtodXZraXFjY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MjYwMDIsImV4cCI6MjA1NTMwMjAwMn0.Zxe1DGaTV69rwgMaDas5CQJJomzp_NhK-OwRMcGyeHo
```

### 2. Créer les tables dans Supabase

Ouvrez l'éditeur SQL de Supabase et exécutez le script complet disponible dans `SUPABASE_MIGRATION_GUIDE.md` (section "Script SQL Complet").

Le script crée :
- Les tables : `users`, `admins`, `hotel_partners`, `experiences`, `bookings`, `reviews`, `payments`, `notifications`
- Les triggers automatiques pour créer les profils utilisateurs
- Les politiques RLS (Row Level Security) pour sécuriser l'accès aux données
- Les index pour optimiser les performances

### 3. Créer vos premiers comptes

#### Option A : Via l'interface Supabase Auth (Recommandé)

1. Allez dans **Authentication** → **Users** dans Supabase
2. Cliquez sur **Add user** → **Create new user**
3. Entrez l'email et le mot de passe
4. Notez l'UUID de l'utilisateur créé

#### Option B : Via SQL

```sql
-- Créer un utilisateur admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@goldenmoments.com',
  crypt('VotreMotDePasse', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Récupérer l'UUID
SELECT id FROM auth.users WHERE email = 'admin@goldenmoments.com';
```

#### Lier l'utilisateur à un profil admin

Une fois l'utilisateur créé, récupérez son UUID et exécutez :

```sql
-- Remplacez 'UUID_DE_L_UTILISATEUR' par l'UUID réel
INSERT INTO public.admins (user_id, full_name, role, permissions)
VALUES (
  'UUID_DE_L_UTILISATEUR',
  'Administrateur Principal',
  'super_admin',
  '["all"]'::jsonb
);
```

#### Créer un compte partenaire hôtel

```sql
-- Créer l'utilisateur dans auth.users (via interface ou SQL)
-- Puis lier au profil partenaire :

INSERT INTO public.hotel_partners (user_id, hotel_name, contact_name, contact_email, contact_phone, status)
VALUES (
  'UUID_DU_PARTENAIRE',
  'Hôtel Le Grand Paris',
  'Marie Dubois',
  'marie@legrandparis.com',
  '+33 1 23 45 67 89',
  'active'
);
```

### 4. Tester la connexion

1. Redémarrez le serveur de développement (il devrait redémarrer automatiquement après l'ajout des variables d'environnement)
2. Accédez à `/login`
3. Connectez-vous avec les identifiants créés
4. Vous devriez être redirigé vers le dashboard approprié (admin ou partenaire)

## 🔐 Sécurité : Row Level Security (RLS)

Les politiques RLS sont déjà configurées dans le script SQL :

- **Admins** : Accès complet à toutes les données
- **Partenaires** : Accès uniquement à leurs propres données (expériences, réservations, revenus)
- **Utilisateurs** : Accès en lecture seule aux expériences publiques

## 📊 Structure des données

### Tables principales

1. **users** : Profils utilisateurs de base
2. **admins** : Profils administrateurs avec permissions
3. **hotel_partners** : Profils partenaires hôteliers
4. **experiences** : Expériences proposées par les hôtels
5. **bookings** : Réservations des clients
6. **reviews** : Avis clients
7. **payments** : Paiements et transactions
8. **notifications** : Notifications système

### Relations

```
users (1) ←→ (1) admins
users (1) ←→ (1) hotel_partners
hotel_partners (1) ←→ (N) experiences
experiences (1) ←→ (N) bookings
bookings (1) ←→ (N) reviews
bookings (1) ←→ (1) payments
```

## 🚀 Prochaines étapes après configuration

Une fois la configuration terminée, vous pourrez :

1. **Implémenter les pages de gestion** :
   - Réservations (admin et partenaire)
   - Expériences (CRUD complet)
   - Utilisateurs (admin uniquement)
   - Analytics et rapports

2. **Ajouter les fonctionnalités avancées** :
   - Upload d'images pour les expériences
   - Calendrier de disponibilité
   - Système de notifications en temps réel
   - Export CSV/PDF des données

3. **Optimiser l'expérience utilisateur** :
   - Filtres et recherche avancée
   - Pagination des listes
   - Graphiques et visualisations
   - Responsive design mobile

## 📝 Notes importantes

- **Supabase Auth** gère automatiquement les sessions et les tokens
- **RLS** assure que chaque utilisateur ne voit que ses propres données
- **Triggers** créent automatiquement les profils lors de l'inscription
- **tRPC** valide et type toutes les requêtes automatiquement

## 🆘 Dépannage

### La page /login est blanche
→ Vérifiez que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien configurées

### Erreur "supabaseUrl is required"
→ Les variables d'environnement ne sont pas chargées, redémarrez le serveur

### Impossible de se connecter
→ Vérifiez que l'utilisateur existe dans Supabase Auth et qu'il est lié à un profil (admin ou hotel_partner)

### Erreur "User not found in database"
→ L'utilisateur existe dans Auth mais pas dans la table `admins` ou `hotel_partners`, exécutez les INSERT SQL

---

**Besoin d'aide ?** Consultez le fichier `SUPABASE_MIGRATION_GUIDE.md` pour plus de détails techniques.
