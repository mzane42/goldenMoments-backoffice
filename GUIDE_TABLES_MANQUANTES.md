# Guide d'installation des tables manquantes - Golden Moments Backoffice

## 📋 Vue d'ensemble

Ce guide vous explique comment ajouter les **5 tables manquantes** nécessaires au bon fonctionnement du backoffice, sans toucher à vos tables existantes.

## ✅ Tables déjà présentes (ne seront pas modifiées)

Votre base de données Supabase contient déjà :
- ✅ `users` - Profils utilisateurs
- ✅ `experiences` - Expériences hôtelières
- ✅ `reservations` - Réservations clients
- ✅ `wishlists` - Listes de favoris
- ✅ `video_productions` - Productions vidéo
- ✅ `waitlist` - Liste d'attente

## ❌ Tables manquantes à créer

Le backoffice nécessite 5 tables supplémentaires :

### 1. **admins** 
Gère les administrateurs du backoffice avec leurs rôles et permissions
- `super_admin` : Accès complet
- `admin` : Gestion quotidienne
- `moderator` : Modération du contenu

### 2. **hotel_partners**
Gère les partenaires hôteliers qui proposent des expériences
- Informations de contact
- Taux de commission
- Statut (actif/inactif/en attente)

### 3. **reviews**
Avis clients sur les expériences
- Note de 1 à 5 étoiles
- Commentaire
- Réponse de l'admin
- Statut de publication

### 4. **payments**
Transactions et paiements
- Montant et devise
- Méthode de paiement
- Statut (en attente/complété/échoué/remboursé)
- ID de transaction

### 5. **notifications**
Système de notifications pour les utilisateurs
- Type (réservation/paiement/avis/système)
- Statut lu/non lu
- Données JSON personnalisées

## 🚀 Installation en 3 étapes

### Étape 1 : Ouvrir l'éditeur SQL Supabase

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet **Golden Moments**
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New query** pour créer une nouvelle requête

### Étape 2 : Copier et exécuter le script

1. Ouvrez le fichier `MISSING_TABLES.sql` dans le projet
2. Copiez **tout le contenu** du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

⏱️ L'exécution prend environ **10-15 secondes**.

### Étape 3 : Vérifier l'installation

À la fin du script, vous verrez un tableau récapitulatif :

```
table_name       | column_count
-----------------+-------------
admins           | 8
hotel_partners   | 10
notifications    | 8
payments         | 15
reviews          | 12
```

Si vous voyez ces 5 lignes, **l'installation est réussie** ! ✅

## 🔐 Sécurité : Row Level Security (RLS)

Le script active automatiquement les politiques de sécurité :

### Pour les admins :
- ✅ Peuvent voir et gérer toutes les données
- ✅ Les super_admins peuvent gérer les autres admins

### Pour les partenaires hôteliers :
- ✅ Peuvent voir uniquement leurs propres données
- ✅ Les admins peuvent voir tous les partenaires

### Pour les utilisateurs :
- ✅ Peuvent voir leurs propres paiements et notifications
- ✅ Peuvent créer des avis
- ✅ Tout le monde peut lire les avis publiés

## 👥 Créer vos premiers comptes

### Créer un administrateur

1. **Créer l'utilisateur dans Supabase Auth** :
   - Allez dans **Authentication** → **Users**
   - Cliquez sur **Add user** → **Create new user**
   - Email : `admin@goldenmoments.com`
   - Mot de passe : (choisissez un mot de passe sécurisé)
   - Cochez **Auto Confirm User**
   - Cliquez sur **Create user**

2. **Copier l'UUID de l'utilisateur** (affiché dans la colonne ID)

3. **Lier l'utilisateur au profil admin** :
   ```sql
   INSERT INTO public.admins (user_id, full_name, role, permissions)
   VALUES (
     'COLLEZ_UUID_ICI',
     'Administrateur Principal',
     'super_admin',
     '["all"]'::jsonb
   );
   ```

### Créer un partenaire hôtelier

1. **Créer l'utilisateur dans Supabase Auth** (même processus)
   - Email : `contact@hotelexemple.com`

2. **Lier l'utilisateur au profil partenaire** :
   ```sql
   INSERT INTO public.hotel_partners (
     user_id, 
     hotel_name, 
     contact_name, 
     contact_email, 
     contact_phone, 
     status
   )
   VALUES (
     'COLLEZ_UUID_ICI',
     'Hôtel Le Grand Paris',
     'Marie Dubois',
     'marie@legrandparis.com',
     '+33 1 23 45 67 89',
     'active'
   );
   ```

## 🧪 Tester la connexion

1. Accédez à votre backoffice : https://3000-i8ijm3zhhm9jqgl0qz0rw-64dc45fb.manusvm.computer/login
2. Connectez-vous avec les identifiants créés
3. Vous serez redirigé vers le dashboard approprié :
   - **Admins** → `/admin`
   - **Partenaires** → `/partner`

## 📊 Colonnes ajoutées aux tables existantes

Le script ajoute également quelques colonnes aux tables existantes (si elles n'existent pas déjà) :

### Table `experiences` :
- `created_by` : UUID de l'utilisateur qui a créé l'expérience
- `last_modified_by` : UUID du dernier utilisateur qui a modifié
- `partner_id` : Référence au partenaire hôtelier

### Table `reservations` :
- `admin_notes` : Notes internes pour les admins
- `cancellation_reason` : Raison de l'annulation
- `cancelled_by` : UUID de l'utilisateur qui a annulé
- `cancelled_at` : Date d'annulation

## ⚠️ Notes importantes

- ✅ Le script utilise `CREATE TABLE IF NOT EXISTS` : **aucun risque de doublon**
- ✅ Les colonnes sont ajoutées avec `IF NOT EXISTS` : **aucun conflit**
- ✅ Le trigger `handle_new_user()` crée automatiquement un profil dans `users` lors de l'inscription
- ✅ Toutes les tables ont des index pour optimiser les performances
- ✅ Les triggers `updated_at` mettent à jour automatiquement la date de modification

## 🆘 Dépannage

### Erreur "relation already exists"
→ Normal si vous réexécutez le script, il ignore les tables déjà créées

### Erreur "permission denied"
→ Assurez-vous d'être connecté avec le bon projet Supabase

### Erreur "foreign key constraint"
→ Vérifiez que la table `auth.users` existe (elle devrait être créée automatiquement par Supabase)

---

**Prêt à continuer ?** Une fois les tables créées et les comptes configurés, vous pourrez utiliser pleinement le backoffice !
