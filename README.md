# Golden Moments Backoffice

Backoffice de gestion pour la marketplace d'expériences hôtelières Golden Moments, avec deux interfaces distinctes : **Admin** (accès complet) et **Partenaire Hôtel** (accès limité).

## 🎯 Fonctionnalités

### Interface Administrateur

L'interface administrateur offre un accès complet à toutes les fonctionnalités de gestion :

#### Dashboard Analytics
- **KPIs en temps réel** : Visualisation des métriques clés (réservations totales, GMV mensuel, taux d'annulation, expériences populaires)
- **Graphiques de tendances** : Analyse des réservations sur 7 et 30 jours
- **Top expériences** : Classement des expériences les plus réservées avec revenus associés
- **Distribution par hôtel** : Vue d'ensemble des performances par partenaire

#### Gestion des Réservations
- **Liste complète** avec filtres avancés (statut, dates, hôtel, montant)
- **Recherche rapide** par référence de réservation
- **Vue détaillée** de chaque réservation avec historique complet
- **Actions** : Annulation, modification du statut, ajout de notes administratives
- **Export CSV** pour analyse externe
- **Statistiques** : Total réservations, GMV mensuel, taux d'annulation

#### CRUD Expériences
- **Formulaire de création** complet avec upload d'images multiples
- **Édition inline** pour modifications rapides (prix, disponibilité, statut)
- **Actions bulk** : Désactivation des expériences expirées, duplication pour nouvelle période
- **Gestion des images** avec prévisualisation
- **Filtres** par catégorie, hôtel, statut, dates

#### Gestion Utilisateurs
- **Liste complète** avec recherche (email, téléphone, nom)
- **Filtres** par date d'inscription, statut
- **Vue profil** utilisateur avec toutes les informations
- **Historique des réservations** par utilisateur
- **Actions** : Réinitialisation mot de passe, suppression compte
- **Export** liste emails pour campagnes marketing

#### Gestion Partenaires Hôteliers
- **Liste des partenaires** avec informations complètes
- **Création de nouveaux partenaires** avec assignation de rôles
- **Modification** des informations (contact, commission, statut)
- **Activation/désactivation** des comptes partenaires

### Interface Partenaire Hôtel

L'interface partenaire offre un accès limité et sécurisé aux données propres à chaque hôtel :

#### Dashboard Partenaire
- **Revenus Golden Moments** : Mois en cours vs mois précédent
- **Nombre de réservations** avec évolution
- **Taux d'occupation additionnel** calculé automatiquement
- **Graphique d'évolution mensuelle** des revenus

#### Mes Expériences
- **Liste filtrée** : Uniquement les expériences de l'hôtel (RLS)
- **Édition limitée** : Prix, disponibilité (date_start/date_end), statut actif/inactif
- **Restrictions** : Titre, description, images en lecture seule (contact admin requis pour modifications)
- **Indicateurs** : Nombre de réservations, revenus par expérience

#### Calendrier de Disponibilité
- **Vue calendrier** avec fenêtre glissante 7-14 jours
- **Toggle disponibilité** par date (bloquer/débloquer)
- **Synchronisation temps réel** avec l'application mobile
- **Indicateurs visuels** : Jours réservés, disponibles, bloqués

#### Réservations Reçues
- **Liste en lecture seule** des réservations de l'hôtel
- **Détails complets** : Nom client, téléphone, dates, nombre d'invités, référence
- **Filtres** : À venir, passées, par statut
- **Export PDF** : Liste des check-ins quotidiens/hebdomadaires

#### Mes Revenus
- **Revenus totaux** Golden Moments (mois en cours, mois précédent)
- **Nombre de réservations** par période
- **Taux d'occupation additionnel** grâce à Golden Moments
- **Graphique d'évolution** mensuelle avec comparatif

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend** : React 19 + TypeScript + Tailwind CSS 4
- **Backend** : Express 4 + tRPC 11
- **Base de données** : MySQL/TiDB via Drizzle ORM
- **Authentification** : Manus OAuth avec gestion des rôles
- **UI Components** : shadcn/ui
- **État** : React hooks + tRPC client

### Structure du Projet

```
golden-moments-backoffice/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── PartnerLayout.tsx
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── admin/       # Pages admin
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── partner/     # Pages partenaire
│   │   │   │   └── Dashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── lib/
│   │   │   └── trpc.ts      # Client tRPC
│   │   └── App.tsx          # Routes principales
│   └── public/              # Assets statiques
├── server/                   # Backend Express + tRPC
│   ├── routers.ts           # Procédures tRPC
│   ├── db.ts                # Helpers base de données
│   └── _core/               # Infrastructure
├── drizzle/                 # Schéma et migrations
│   ├── schema.ts            # Définition des tables
│   └── migrations/          # Fichiers de migration SQL
└── shared/                  # Types et constantes partagés
```

### Schéma de Base de Données

#### Table `users`
Utilisateurs clients de la plateforme.

```typescript
{
  id: int (PK),
  authId: varchar(64) UNIQUE,
  fullName: text,
  email: varchar(320),
  phoneNumber: varchar(20),
  profilePicture: text,
  preferences: text (JSON),
  role: enum('user', 'admin'),
  createdAt: timestamp,
  updatedAt: timestamp,
  lastSignedIn: timestamp
}
```

#### Table `admins`
Administrateurs du backoffice.

```typescript
{
  id: int (PK),
  authId: varchar(64) UNIQUE,
  fullName: text NOT NULL,
  email: varchar(320) UNIQUE NOT NULL,
  role: enum('super_admin', 'admin', 'moderator'),
  permissions: text (JSON),
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Table `hotelPartners`
Partenaires hôteliers.

```typescript
{
  id: int (PK),
  authId: varchar(64) UNIQUE,
  hotelName: text NOT NULL,
  company: text NOT NULL,
  contactName: text NOT NULL,
  email: varchar(320) UNIQUE NOT NULL,
  phone: varchar(20),
  address: text (JSON),
  status: enum('active', 'inactive', 'pending'),
  commissionRate: decimal(5,2),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Table `experiences`
Expériences/offres hôtelières.

```typescript
{
  id: int (PK),
  title: text NOT NULL,
  description: text NOT NULL,
  longDescription: text,
  price: int NOT NULL, // Prix en centimes
  images: text NOT NULL (JSON array),
  category: text NOT NULL,
  location: text (JSON),
  rating: decimal(3,2),
  reviewCount: int,
  items: text (JSON), // Amenities
  checkInInfo: text (JSON),
  transportation: text (JSON),
  accessibility: text (JSON),
  additionalInfo: text (JSON),
  schedules: text (JSON),
  dateStart: timestamp,
  dateEnd: timestamp,
  company: text,
  imageUrl: text,
  isActive: boolean,
  createdBy: int,
  lastModifiedBy: int,
  maxCapacity: int,
  minCapacity: int,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Table `reservations`
Réservations des utilisateurs.

```typescript
{
  id: int (PK),
  userId: int NOT NULL,
  experienceId: int NOT NULL,
  bookingReference: varchar(50) UNIQUE NOT NULL,
  checkInDate: timestamp NOT NULL,
  checkOutDate: timestamp NOT NULL,
  roomType: text NOT NULL,
  guestCount: int,
  totalPrice: int NOT NULL, // Prix en centimes
  status: enum('confirmed', 'cancelled', 'completed'),
  paymentStatus: enum('pending', 'paid', 'refunded', 'failed'),
  adminNotes: text,
  cancellationReason: text,
  cancelledBy: int,
  cancelledAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Table `wishlists`
Listes de souhaits des utilisateurs.

```typescript
{
  id: int (PK),
  userId: int NOT NULL,
  experienceId: int NOT NULL,
  createdAt: timestamp
}
```

## 🔐 Système de Permissions

### Rôles et Accès

| Fonctionnalité | Admin | Hotel Partner |
|----------------|-------|---------------|
| Voir toutes les réservations | ✅ | ❌ (seulement les siennes) |
| Annuler une réservation | ✅ | ❌ |
| Créer une expérience | ✅ | ❌ |
| Modifier prix/disponibilité | ✅ | ✅ (ses expériences) |
| Modifier titre/description | ✅ | ❌ |
| Gérer les utilisateurs | ✅ | ❌ |
| Voir analytics globales | ✅ | ❌ (seulement ses revenus) |
| Exporter données | ✅ | ✅ (ses données) |

### Middleware tRPC

Le système utilise des middlewares tRPC pour sécuriser les routes :

```typescript
// Procédure admin uniquement
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const admin = await db.getAdminByAuthId(ctx.user.authId);
  if (!admin) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, admin } });
});

// Procédure partenaire uniquement
const hotelPartnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const partner = await db.getHotelPartnerByAuthId(ctx.user.authId);
  if (!partner) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, partner } });
});
```

### Row Level Security (RLS)

Les partenaires hôteliers voient uniquement leurs propres données grâce à des filtres au niveau des requêtes :

```typescript
// Expériences filtrées par company
export async function getExperiencesByCompany(company: string) {
  return db.select().from(experiences)
    .where(eq(experiences.company, company));
}

// Réservations filtrées par company via join
export async function getReservationsByCompany(company: string) {
  return db.select()
    .from(reservations)
    .leftJoin(experiences, eq(reservations.experienceId, experiences.id))
    .where(eq(experiences.company, company));
}
```

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ et pnpm
- Accès à une base de données MySQL/TiDB
- Compte Manus pour l'authentification OAuth

### Installation

1. **Cloner le projet** (déjà fait si vous utilisez le système Manus)

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer la base de données**

Les variables d'environnement sont automatiquement injectées par le système Manus. Vous devez cependant exécuter les migrations :

```bash
# Via l'interface de gestion de base de données Manus
# Ou manuellement via le fichier SQL fourni
```

Le fichier `drizzle/migrations/0001_schema_update.sql` contient toutes les migrations nécessaires.

4. **Créer les comptes administrateurs et partenaires**

Utilisez l'interface de gestion de base de données pour insérer les premiers comptes :

```sql
-- Créer un super admin
INSERT INTO admins (authId, fullName, email, role, isActive)
VALUES ('auth_id_from_manus', 'Votre Nom', 'admin@goldenmoments.com', 'super_admin', true);

-- Créer un partenaire hôtel
INSERT INTO hotelPartners (authId, hotelName, company, contactName, email, status)
VALUES ('auth_id_from_manus', 'Hôtel Plaza', 'Plaza Athénée Paris', 'Jean Dupont', 'contact@plaza.com', 'active');
```

**Important** : L'`authId` doit correspondre à l'ID OAuth de l'utilisateur dans le système Manus. L'utilisateur doit d'abord se connecter une fois pour que son compte soit créé dans la table `users`, puis vous pouvez récupérer son `authId` et l'ajouter aux tables `admins` ou `hotelPartners`.

5. **Lancer le serveur de développement**

```bash
pnpm dev
```

Le backoffice sera accessible à l'URL fournie par le système Manus.

## 📝 Guide d'Utilisation

### Pour les Administrateurs

1. **Connexion** : Cliquez sur "Se connecter" et utilisez vos identifiants Manus
2. **Dashboard** : Accédez au tableau de bord pour voir les KPIs et statistiques
3. **Gestion des réservations** : 
   - Filtrez par statut, dates, hôtel
   - Recherchez par référence
   - Annulez ou modifiez les réservations
   - Exportez en CSV
4. **Gestion des expériences** :
   - Créez de nouvelles expériences
   - Modifiez prix, disponibilité, statut
   - Désactivez les expériences expirées en masse
5. **Gestion des utilisateurs** :
   - Recherchez par email/téléphone
   - Consultez l'historique des réservations
   - Exportez les emails pour marketing

### Pour les Partenaires Hôteliers

1. **Connexion** : Utilisez vos identifiants Manus fournis par l'administrateur
2. **Dashboard** : Consultez vos revenus et performances
3. **Mes expériences** :
   - Modifiez prix et disponibilités
   - Activez/désactivez vos offres
   - Contactez l'admin pour modifier titre/description/images
4. **Calendrier** :
   - Gérez les disponibilités jour par jour
   - Bloquez/débloquez des dates
5. **Réservations** :
   - Consultez les réservations reçues
   - Exportez la liste des check-ins en PDF
6. **Revenus** :
   - Suivez vos revenus mensuels
   - Comparez avec le mois précédent

## 🔧 Développement

### Ajouter une nouvelle fonctionnalité

1. **Mettre à jour le schéma** dans `drizzle/schema.ts`
2. **Exécuter la migration** : `pnpm db:push`
3. **Ajouter les helpers** dans `server/db.ts`
4. **Créer les procédures tRPC** dans `server/routers.ts`
5. **Créer les composants UI** dans `client/src/pages/`
6. **Ajouter les routes** dans `client/src/App.tsx`

### Structure des procédures tRPC

```typescript
// Exemple de procédure admin
admin: router({
  experiences: router({
    list: adminProcedure.query(async () => {
      return db.getAllExperiences();
    }),
    
    create: adminProcedure
      .input(z.object({ title: z.string(), ... }))
      .mutation(async ({ input, ctx }) => {
        await db.createExperience({ ...input, createdBy: ctx.admin.id });
        return { success: true };
      }),
  }),
}),
```

### Utilisation côté client

```typescript
// Dans un composant React
const { data, isLoading } = trpc.admin.experiences.list.useQuery();

const createMutation = trpc.admin.experiences.create.useMutation({
  onSuccess: () => {
    toast.success("Expérience créée avec succès");
  },
});
```

## 📊 Analytics et Rapports

Le système collecte automatiquement les données suivantes :

- **Réservations** : Total, GMV, taux d'annulation
- **Expériences** : Top performances, revenus par expérience
- **Hôtels** : Revenus par partenaire, nombre de réservations
- **Utilisateurs** : Nouveaux inscrits, taux de conversion

Ces données sont accessibles via :
- Dashboard admin (vue globale)
- Dashboard partenaire (vue filtrée)
- Exports CSV/PDF

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- ✅ **Authentification OAuth** via Manus
- ✅ **Middleware de vérification des rôles** sur toutes les routes protégées
- ✅ **Filtrage des données** au niveau base de données (RLS)
- ✅ **Validation des inputs** avec Zod
- ✅ **Protection CSRF** via tRPC
- ✅ **Sessions sécurisées** avec cookies HTTP-only
- ✅ **Sanitization** des données utilisateur

### Recommandations

- Ne jamais partager les `authId` publiquement
- Toujours vérifier les permissions côté serveur
- Utiliser HTTPS en production
- Auditer régulièrement les accès

## 🐛 Dépannage

### Problème : "Accès non autorisé"

**Solution** : Vérifiez que l'utilisateur a bien un enregistrement dans la table `admins` ou `hotelPartners` avec le bon `authId`.

### Problème : Les données ne s'affichent pas

**Solution** : 
1. Vérifiez que les migrations ont été exécutées
2. Vérifiez que les données existent dans la base
3. Consultez la console du navigateur pour les erreurs tRPC

### Problème : Erreur de connexion à la base de données

**Solution** : Les variables d'environnement sont gérées automatiquement par Manus. Si le problème persiste, contactez le support.

## 📚 Documentation Complémentaire

- [Documentation tRPC](https://trpc.io/)
- [Documentation Drizzle ORM](https://orm.drizzle.team/)
- [Documentation shadcn/ui](https://ui.shadcn.com/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)

## 🤝 Support

Pour toute question ou problème :
1. Consultez la documentation ci-dessus
2. Vérifiez les logs dans la console du navigateur
3. Consultez les logs serveur dans le terminal
4. Contactez l'équipe de développement

## 📄 Licence

© 2024 Golden Moments. Tous droits réservés.
