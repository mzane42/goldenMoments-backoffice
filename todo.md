# Golden Moments Backoffice - TODO

## Migration vers Supabase
- [x] Ajouter les secrets Supabase (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [x] Installer les dépendances Supabase (@supabase/supabase-js, @supabase/ssr)
- [x] Créer le client Supabase côté serveur (server/supabase.ts)
- [x] Créer le client Supabase côté client (client/src/lib/supabase.ts)
- [x] Implémenter Supabase Auth dans le contexte React (SupabaseAuthContext.tsx)
- [x] Remplacer les helpers Drizzle par des requêtes Supabase (server/db.ts)
- [x] Adapter les procédures tRPC pour utiliser Supabase (server/supabaseRouters.ts)
- [x] Créer le guide de migration complet (SUPABASE_MIGRATION_GUIDE.md)
- [x] Exécuter le script SQL dans Supabase pour créer les tables
- [x] Connecter les nouveaux fichiers Supabase au serveur principal
- [x] Mettre à jour les composants UI pour utiliser useSupabaseAuth()
- [x] Tester l'authentification Supabase
- [x] Tester les permissions RLS

## Configuration Initiale
- [x] Configurer le schéma de base de données avec tables admins et hotel_partners
- [x] Créer les helpers de base de données pour les requêtes
- [x] Implémenter le système d'authentification avec rôles (admin, hotel_partner)
- [x] Configurer les procédures tRPC protégées par rôle

## Interface Admin - Dashboard
- [x] Créer le layout admin avec navigation sidebar
- [x] Implémenter le dashboard analytics avec KPIs
- [x] Ajouter les graphiques de tendances (réservations, revenus)
- [x] Créer les widgets de statistiques (GMV, taux de conversion, nouveaux utilisateurs)

## Interface Partenaire Hôtel - Dashboard
- [x] Créer le layout partenaire avec navigation
- [x] Dashboard avec métriques propres à l'hôtel
- [x] Widget revenus (mois en cours, mois précédent)
- [x] Graphique évolution mensuelle


## Finalisation Migration Supabase (EN COURS)
- [x] Modifier server/_core/index.ts pour utiliser supabaseContext et supabaseRouters
- [x] Ajouter SupabaseAuthProvider dans client/src/main.tsx
- [x] Créer un nouveau hook useAuth basé sur Supabase
- [x] Mettre à jour Home.tsx pour utiliser Supabase Auth
- [x] Mettre à jour AdminLayout.tsx pour utiliser Supabase Auth
- [x] Mettre à jour PartnerLayout.tsx pour utiliser Supabase Auth
- [x] Corriger les erreurs TypeScript dans oauth.ts et sdk.ts
- [x] Créer la page de connexion Supabase (Login.tsx)
- [x] Mettre à jour le client tRPC pour envoyer le token Supabase
- [x] Exécuter le script SQL dans Supabase pour créer les tables
- [x] Créer les comptes admin et partenaires dans Supabase
- [x] Tester la connexion et les permissions


## Mise à jour du guide de migration
- [x] Analyser le schéma Supabase existant de l'utilisateur
- [x] Identifier les tables manquantes (admins, hotel_partners, reviews, payments, notifications)
- [x] Créer un script SQL avec uniquement les tables manquantes (MISSING_TABLES.sql)
- [x] Créer un guide d'installation simplifié (GUIDE_TABLES_MANQUANTES.md)
