# Migration vers Supabase - Guide Rapide

## 🎯 Objectif

Migrer le backoffice Golden Moments de Manus OAuth + MySQL vers Supabase Auth + PostgreSQL.

## ⚠️ État Actuel

Le projet a été partiellement préparé pour Supabase :

✅ **Fichiers créés** :
- `server/supabase.ts` - Client Supabase serveur
- `server/db.ts` - Helpers de base de données Supabase
- `server/supabaseRouters.ts` - Routes tRPC pour Supabase
- `server/_core/supabaseContext.ts` - Contexte tRPC Supabase
- `server/_core/supabaseTrpc.ts` - Middlewares tRPC Supabase
- `client/src/lib/supabase.ts` - Client Supabase client
- `client/src/contexts/SupabaseAuthContext.tsx` - Contexte Auth React

❌ **Non terminé** :
- Le système utilise encore Manus OAuth par défaut
- Les nouveaux fichiers Supabase ne sont pas encore connectés au serveur principal
- Le frontend utilise encore l'ancien système d'auth

## 🚀 Pour Terminer la Migration

### Option A : Migration Complète (Recommandé)

Cette option remplace complètement Manus OAuth par Supabase.

#### 1. Créer le schéma dans Supabase

Suivez le guide détaillé dans `SUPABASE_MIGRATION_GUIDE.md` :
- Exécutez le script SQL complet dans l'éditeur Supabase
- Créez les comptes admin et partenaires
- Configurez les providers d'authentification

#### 2. Modifier le serveur principal

Remplacez dans `server/_core/index.ts` :

```typescript
// AVANT (Manus OAuth)
import { createContext } from "./context";
import { appRouter } from "../routers";

// APRÈS (Supabase)
import { createContext } from "./supabaseContext";
import { appRouter } from "../supabaseRouters";
```

#### 3. Modifier le client React

Dans `client/src/main.tsx`, ajoutez le provider Supabase :

```typescript
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';

// Enveloppez l'app avec SupabaseAuthProvider
<SupabaseAuthProvider>
  <App />
</SupabaseAuthProvider>
```

#### 4. Mettre à jour les composants

Remplacez `useAuth()` par `useSupabaseAuth()` dans :
- `client/src/pages/Home.tsx`
- `client/src/components/AdminLayout.tsx`
- `client/src/components/PartnerLayout.tsx`

### Option B : Système Hybride (Temporaire)

Gardez Manus OAuth pour l'authentification mais utilisez Supabase pour les données.

#### 1. Créer le schéma dans Supabase

Exécutez uniquement les tables (sans les politiques RLS liées à auth.users) :

```sql
-- Tables sans références à auth.users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  auth_id TEXT NOT NULL UNIQUE, -- Utiliser TEXT au lieu de UUID
  full_name TEXT,
  email VARCHAR(320),
  ...
);

-- Pas de RLS pour l'instant
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

#### 2. Modifier uniquement `server/db.ts`

Le fichier est déjà prêt, il suffit de l'utiliser dans `server/routers.ts`.

## 📋 Checklist de Migration

- [ ] Exécuter le script SQL dans Supabase
- [ ] Créer les comptes admin et partenaires
- [ ] Ajouter les variables d'environnement frontend (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Modifier server/_core/index.ts pour utiliser supabaseContext
- [ ] Modifier server/routers.ts pour utiliser supabaseRouters
- [ ] Ajouter SupabaseAuthProvider dans client/src/main.tsx
- [ ] Remplacer useAuth() par useSupabaseAuth() dans les composants
- [ ] Tester la connexion admin
- [ ] Tester la connexion partenaire
- [ ] Vérifier les permissions RLS
- [ ] Importer les données existantes (si nécessaire)

## 🆘 Besoin d'Aide ?

Si vous préférez que je termine la migration automatiquement, dites-moi et je :

1. Modifierai les fichiers core pour utiliser Supabase
2. Mettrai à jour tous les composants React
3. Créerai un script de migration des données
4. Testerai le système complet

Sinon, suivez le guide détaillé dans `SUPABASE_MIGRATION_GUIDE.md`.

## 📚 Fichiers Importants

- `SUPABASE_MIGRATION_GUIDE.md` - Guide complet étape par étape
- `server/supabase.ts` - Configuration client Supabase
- `server/db.ts` - Helpers de base de données (déjà adaptés pour Supabase)
- `server/supabaseRouters.ts` - Routes tRPC complètes
