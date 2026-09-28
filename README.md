# 🚀 Reducte — Plateforme de Gestion des Services Informatiques & Maintenance (ITSM)

Application web full-stack moderne et sécurisée conçue pour l'entreprise **Reducte**. Elle centralise et automatise l'ensemble des opérations d'assistance informatique (ITSM) : référentiel clients, inventaire de parc matériel, cycle de vie complet des tickets d'incidents, affectation dynamique des techniciens, résolutions techniques et tableaux de bord analytiques en temps réel.

---

## 📋 Table des Matières

- [🌟 Présentation Générale](#-présentation-générale)
- [👥 Matrice des Rôles & Fonctionnalités (RBAC)](#-matrice-des-rôles--fonctionnalités-rbac)
- [🔑 Comptes de Démonstration & Tests](#-comptes-de-démonstration--tests)
- [🔄 Scénario de Test de Bout en Bout](#-scénario-de-test-de-bout-en-bout)
- [🛠️ Stack Technique](#️-stack-technique)
- [📁 Architecture du Projet (MVC)](#-architecture-du-projet-mvc)
- [💾 Modèle de Données & Persistance](#-modèle-de-données--persistance)
- [🔌 Documentation des Endpoints API](#-documentation-des-endpoints-api)
- [🛡️ Sécurité & Bonnes Pratiques](#️-sécurité--bonnes-pratiques)
- [⚙️ Installation & Démarrage](#️-installation--démarrage)
- [📄 Références & Fichiers de Spécifications](#-références--fichiers-de-spécifications)

---

## 🌟 Présentation Générale

La solution **Reducte ITSM** structure et fluidifie la relation opérationnelle entre les clients, les techniciens de maintenance et les administrateurs système :

1. **Sécurité & Contrôle d'Accès Basé sur les Rôles (RBAC)** :
   - Isolation stricte des données selon le rôle (`admin`, `technicien`, `client`).
   - Authentification par jetons JWT signés et mots de passe hachés avec `bcryptjs`.
2. **Gestion de Parc Matériel (CMDB / Hardware Assets)** :
   - Inventaire complet des équipements rattachés aux entreprises clientes : serveurs, postes fixes, ordinateurs portables, périphériques réseau, unités de stockage, imprimantes.
   - Suivi par marque, modèle, numéro de série unique et date de mise en service.
3. **Cycle de Vie Intégral des Tickets d'Incidents** :
   - Workflow d'assistance normalisé : `Nouvelle` ➔ `Affectée` ➔ `En cours` ➔ `Terminée` (ou `Annulée`).
   - Niveaux de priorité configurables : `Faible`, `Moyenne`, `Élevée`.
   - Création automatique du dossier de service (intervention) lors de l'enregistrement de toute demande.
4. **Affectation Dynamique & Réactive des Techniciens** :
   - Attribution directe d'un technicien depuis la page **Demandes de services** ou via la console **Gestion des services**.
   - Chargement dynamique et en temps réel de la liste des techniciens actifs lors de l'ouverture de la modale d'affectation (intégration immédiate des techniciens nouvellement créés sans rechargement de page).
5. **Rapports & Clôture d'Interventions** :
   - Prise en charge (`En cours`) et saisie des notes techniques de diagnostic et de résolution par les techniciens.
   - Clôture (`Terminée`) avec synchronisation automatique du statut de la demande associée.
6. **Tableaux de Bord Analytiques & KPIs Spécifiques** :
   - Indicateurs en temps réel (tickets en attente, interventions en cours, matériels recensés, répartition par catégorie et statut).
   - Visualisations interactives alimentées par Chart.js et filtrées automatiquement selon les privilèges de l'utilisateur connecté.
7. **Moteur de Recherche Globale Transversale** :
   - Recherche instantanée et filtrage multicritère sur l'ensemble des modules (clients, matériels, demandes, interventions, techniciens).

---

## 👥 Matrice des Rôles & Fonctionnalités (RBAC)

| Fonctionnalité / Module | Administrateur (`admin`) | Technicien (`technicien`) | Client (`client`) |
| :--- | :---: | :---: | :---: |
| **Auto-inscription publique** | ❌ | ❌ | ✅ (`/inscription`) |
| **Tableau de bord (KPI & Graphes)** | ✅ Vue globale | ✅ Vue personnelle (assignations) | ✅ Vue entreprise (ses tickets & parc) |
| **Gestion des Clients (CRUD)** | ✅ CRUD complet | 👁️ Consultation | ❌ |
| **Inventaire Équipements** | ✅ CRUD complet | 👁️ Consultation | ✅ Matériel de son entreprise |
| **Création d'une Demande** | ✅ Pour tout client | ❌ | ✅ Pour ses équipements |
| **Affectation Technicien** | ✅ (Demandes & Services) | ❌ | ❌ |
| **Prise en charge (`En cours`)** | ✅ | ✅ (Ses interventions) | ❌ |
| **Clôture & Notes Techniques** | ✅ | ✅ (Ses interventions) | ❌ |
| **Annulation de Demande** | ✅ | ✅ | ✅ (Ses demandes) |
| **Gestion des Utilisateurs** | ✅ CRUD complet & Rôles | ❌ | ❌ |
| **Modification du Mot de Passe** | ✅ | ✅ | ✅ |
| **Recherche Globale Transversale** | ✅ | ✅ | ✅ (Scorée par droits) |

### 👑 Administrateur
- Supervise et configure l'intégralité du système.
- Crée et active instantanément les comptes techniciens et administrateurs.
- Gère le référentiel des entreprises clientes et leur inventaire matériel.
- Assigne les techniciens aux demandes d'assistance avec actualisation dynamique.
- Dispose d'un tableau de bord exécutif avec métriques globales et historique d'activités.

### 🛠️ Technicien
- Accède à sa file de travail personnalisée d'interventions assignées.
- Consulte les spécifications techniques du matériel concerné et les coordonnées du client.
- Change le statut des interventions (`En cours`, `Terminée`) et rédige les comptes-rendus techniques.
- Visualise ses performances opérationnelles sur son tableau de bord dédié.

### 🏢 Client (Espace Client)
- S'inscrit librement en ligne pour créer son entreprise et son compte principal.
- Enregistre et consulte le parc matériel propre à son organisation.
- Déclare des demandes d'assistance qualifiées et suit leur résolution pas à pas.
- Peut annuler une demande non encore traitée en cas de fausse alerte.

---

## 🔑 Comptes de Démonstration & Tests

Des comptes préconfigurés avec données cohérentes sont prêts à l'emploi :

| Rôle | Email | Mot de passe | Profil Utilisateur |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@reducte.ma` | `admin123` | **Youssef El Amrani** (Superviseur Système) |
| **Technicien** | `tech1@reducte.ma` | `tech123` | **Mehdi Alaoui** (Technicien Réseau & Systèmes Senior) |
| **Technicien** | `tech2@reducte.ma` | `tech123` | **Sofia Berrada** (Technicienne Systèmes & Cloud) |
| **Client** | `contact@alphatech.ma` | `client123` | **Karim Benjelloun** (Alpha Tech SARL) |
| **Client** | `contact@atlasdigital.ma` | `client123` | **Nadia Alami** (Atlas Digital SARL) |

> 💡 **Données de test prêtes à l'emploi** : Retrouvez l'ensemble des jeux de données d'exemples (sociétés, équipements, descriptions d'incidents, numéros de série) dans le fichier [`valeurs_test.txt`](./valeurs_test.txt).

---

## 🔄 Scénario de Test de Bout en Bout

Pour valider le bon fonctionnement de la plateforme en conditions réelles :

1. **Création d'une Demande (Client)** :
   - Connectez-vous avec `contact@alphatech.ma` / `client123`.
   - Allez sur **Demandes de services** ➔ cliquez sur **Nouvelle demande**.
   - Choisissez un équipement de l'entreprise, saisissez l'objet, la description et la priorité (`Élevée`), puis enregistrez. Le statut initial est `Nouvelle`.
2. **Affectation du Technicien (Admin)** :
   - Connectez-vous avec `admin@reducte.ma` / `admin123`.
   - Rendez-vous sur la page **Demandes de services** (ou **Gestion des services**).
   - Repérez la demande nouvellement soumise et cliquez sur l'action d'affectation (icône d'assignation ou bouton **Affecter**).
   - La liste des techniciens est automatiquement chargée en temps réel depuis le serveur. Sélectionnez par exemple **Mehdi Alaoui** et validez. Le statut bascule instantanément sur `Affectée`.
3. **Résolution Technique (Technicien)** :
   - Connectez-vous avec `tech1@reducte.ma` / `tech123`.
   - Accédez à **Gestion des services** : l'intervention assignée est immédiatement visible.
   - Cliquez sur **Mettre à jour le statut** : passez-le à `En cours`, puis à `Terminée` en renseignant les notes de résolution technique.
4. **Vérification & Clôture** :
   - Revenez sur la session de l'administrateur ou du client : la demande et l'intervention apparaissent terminées avec leurs notes techniques et dates d'actualisation synchronisées.

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React 19, TypeScript
- **Bundler & Outillage** : Vite 6
- **Styles & Design** : Tailwind CSS v4 (design moderne, épuré, responsive et accessible)
- **Icônes** : Lucide React
- **Graphiques** : Chart.js & react-chartjs-2
- **Routage** : React Router v7
- **Animations** : Motion

### Backend
- **Serveur d'API** : Node.js avec Express.js (architecture MVC modulaire en TypeScript)
- **Exécution Dev** : `tsx` avec rechargement à chaud
- **Build Production** : Bundling optimisé du serveur via `esbuild` (`dist/server.cjs`)
- **Authentification** : JSON Web Tokens (`jsonwebtoken`) transmis via en-tête `Authorization: Bearer <token>`
- **Sécurité des Mots de Passe** : Hachage salé unidirectionnel avec `bcryptjs`
- **Validation** : Middlewares de validation de schémas, de formats email et d'intégrité relationnelle

### Persistance des Données
- **Base de données relationnelle normalisée en JSON** (`/data/*.json`)
- Gestionnaire de stockage atomique synchrone (`jsonStore.ts`) garantissant l'écriture sécurisée sans corruption de données.
- Auto-initialisation et amorçage automatique (seeding) au premier lancement.

---

## 📁 Architecture du Projet (MVC)

```text
├── data/                       # Base de données persistante normalisée (JSON)
│   ├── utilisateurs.json       # Comptes, mots de passe hachés et rôles RBAC
│   ├── clients.json            # Répertoire des entreprises clientes
│   ├── equipements.json        # Inventaire du matériel informatique
│   ├── demandes.json           # Demandes d'assistance (tickets d'incidents)
│   └── services.json           # Interventions, affectations et résolutions
│
├── server/                     # Backend Express.js (Architecture MVC)
│   ├── controllers/            # Contrôleurs HTTP de traitement des requêtes
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── clientController.ts
│   │   ├── equipementController.ts
│   │   ├── demandeController.ts
│   │   ├── serviceController.ts
│   │   ├── dashboardController.ts
│   │   └── searchController.ts
│   ├── services/               # Couche métier et règles fonctionnelles
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── clientService.ts
│   │   ├── equipementService.ts
│   │   ├── demandeService.ts
│   │   ├── serviceService.ts
│   │   ├── dashboardService.ts
│   │   └── searchService.ts
│   ├── models/                 # Couche d'accès aux données (DAO)
│   │   ├── jsonStore.ts        # Écritures atomiques et gestion des verrous
│   │   ├── userModel.ts
│   │   ├── clientModel.ts
│   │   ├── equipementModel.ts
│   │   ├── demandeModel.ts
│   │   └── serviceModel.ts
│   ├── middleware/             # Middlewares de sécurité et de contrôle
│   │   ├── authMiddleware.ts   # Vérification JWT et RBAC requireRoles()
│   │   ├── validationMiddleware.ts # Validation des champs obligatoires
│   │   └── errorHandler.ts     # Gestion centralisée des erreurs HTTP
│   ├── routes/                 # Définition des routes d'API (/api/*)
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── clientRoutes.ts
│   │   ├── equipementRoutes.ts
│   │   ├── demandeRoutes.ts
│   │   ├── serviceRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   └── searchRoutes.ts
│   └── utils/                  # Fonctions d'amorçage, hachage et tokens
│
├── src/                        # Frontend React (SPA)
│   ├── components/             # Composants réutilisables (Layout, Modal, Pagination, Badges)
│   ├── context/                # Contextes React globaux (AuthContext)
│   ├── pages/                  # Vues applicatives
│   │   ├── DashboardPage.tsx
│   │   ├── ClientsPage.tsx
│   │   ├── EquipementsPage.tsx
│   │   ├── DemandesPage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ChangePasswordPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/               # Client HTTP Axios/Fetch pour les API
│   └── types/                  # Types et interfaces TypeScript partagés
│
├── cahier_des_charges.txt      # Cahier des charges fonctionnel et technique complet
├── valeurs_test.txt            # Données de test pour formulaires
├── server.ts                   # Point d'entrée serveur (Express + Vite dev middleware)
├── metadata.json               # Métadonnées de l'application
├── package.json
└── README.md
```

---

## 💾 Modèle de Données & Persistance

La base de données interne repose sur un modèle relationnel cohérent stocké dans `/data/` :

- **Utilisateurs (`utilisateurs.json`)** :
  `id`, `nom`, `email`, `motDePasse` (hash bcrypt), `role` (`admin` | `technicien` | `client`), `statut` (`actif` | `inactif`), `dateCreation`.
- **Clients (`clients.json`)** :
  `id`, `userId` (clé étrangère vers `utilisateurs`), `nom`, `prenom`, `societe`, `adresse`, `telephone`, `email`, `dateCreation`.
- **Équipements (`equipements.json`)** :
  `id`, `clientId` (clé étrangère vers `clients`), `nom`, `categorie` (`Serveur` | `PC Fixe` | `PC Portable` | `Réseau` | `Stockage` | `Imprimante` | `Autre`), `marque`, `modele`, `numeroSerie`, `dateInstallation`.
- **Demandes d'Assistance (`demandes.json`)** :
  `id`, `clientId`, `equipementId`, `objet`, `description`, `priorite` (`Faible` | `Moyenne` | `Élevée`), `statut` (`Nouvelle` | `Affectée` | `En cours` | `Terminée` | `Annulée`), `dateCreation`.
- **Services / Interventions (`services.json`)** :
  `id`, `demandeId`, `technicienId` (nullable avant affectation), `statut` (`Nouvelle` | `Affectée` | `En cours` | `Terminée`), `notes`, `dateAffectation`, `dateMiseAJour`.

---

## 🔌 Documentation des Endpoints API

Toutes les routes d'API sont préfixées par `/api` et renvoient des réponses JSON normalisées `{ success: boolean, data?: any, message?: string }`.

### 1. Authentification & Profil (`/api/auth`)
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Inscription client (création compte utilisateur + fiche client) |
| `POST` | `/api/auth/login` | Public | Authentification et émission du jeton JWT Bearer |
| `GET` | `/api/auth/me` | Authentifié | Informations sur l'utilisateur connecté et fiche client liée |
| `POST` | `/api/auth/change-password` | Authentifié | Changement de mot de passe sécurisé |

### 2. Gestion des Utilisateurs (`/api/users`)
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `admin` | Liste de tous les utilisateurs avec filtres et statut |
| `GET` | `/api/users/pending` | `admin` | Liste des utilisateurs en attente de validation |
| `POST` | `/api/users` | `admin` | Création d'un utilisateur (actif par défaut) |
| `PUT` | `/api/users/:id` | `admin` | Mise à jour des informations d'un utilisateur |
| `PUT` | `/api/users/:id/status` | `admin` | Bascule du statut (`actif` / `inactif`) |
| `POST` | `/api/users/:id/validate` | `admin` | Validation d'un compte en attente |
| `POST` | `/api/users/:id/reject` | `admin` | Rejet d'un compte utilisateur |
| `DELETE` | `/api/users/:id` | `admin` | Suppression d'un utilisateur |

### 3. Clients (`/api/clients`)
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/clients` | Tous | Liste des entreprises clientes |
| `GET` | `/api/clients/:id` | Tous | Détails complets d'un client |
| `GET` | `/api/clients/:id/equipements` | Tous | Parc informatique appartenant au client |
| `POST` | `/api/clients` | `admin` | Ajout d'une entreprise cliente |
| `PUT` | `/api/clients/:id` | `admin` | Modification d'une fiche client |
| `DELETE` | `/api/clients/:id` | `admin` | Suppression d'un client et contrôle d'intégrité |

### 4. Équipements (`/api/equipements`)
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/equipements` | Tous | Inventaire des matériels (filtré pour les clients) |
| `GET` | `/api/equipements/:id` | Tous | Fiche technique d'un équipement |
| `POST` | `/api/equipements` | `admin`, `client` | Ajout d'un nouvel équipement au parc |
| `PUT` | `/api/equipements/:id` | `admin`, `technicien` | Mise à jour des données matérielles |
| `DELETE` | `/api/equipements/:id` | `admin`, `client` | Retrait d'un équipement |

### 5. Demandes d'Assistance (`/api/demandes`)
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/demandes` | Tous | Liste des tickets (filtrée selon les privilèges) |
| `GET` | `/api/demandes/:id` | Tous | Détail complet d'une demande |
| `POST` | `/api/demandes` | `admin`, `client` | Création d'une demande et génération de l'intervention |
| `PUT` | `/api/demandes/:id` | `admin`, `technicien` | Modification d'une demande |
| `POST` | `/api/demandes/:id/cancel`| `admin`, `technicien`, `client` | Annulation d'une demande |
| `DELETE` | `/api/demandes/:id` | `admin`, `client` | Suppression d'un ticket |

### 6. Gestion des Services & Interventions (`/api/services`)
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Tous | Dossiers d'intervention (assignés uniquement pour techniciens) |
| `GET` | `/api/services/:id` | Tous | Détails de l'intervention et historique |
| `PUT` | `/api/services/:id/assign` | `admin` | Affectation / réassignation d'un technicien |
| `PUT` | `/api/services/:id/status` | `admin`, `technicien` | Mise à jour du statut (`En cours`, `Terminée`) et des notes |
| `DELETE` | `/api/services/:id` | `admin` | Suppression d'un dossier d'intervention |

### 7. Tableaux de Bord & Recherche Globale
| Méthode | Route | Rôles autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Tous | KPIs et métriques adaptés au profil de l'utilisateur |
| `GET` | `/api/search?q=:query` | Tous | Recherche transversale multicritère (clients, matériel, tickets) |

---

## 🛡️ Sécurité & Bonnes Pratiques

- **Isolation Stricte Multi-Tenant / Multi-Rôle** : Les techniciens ne visualisent que leurs interventions assignées, et les clients uniquement le matériel et les demandes liés à leur société.
- **Protection des Mots de Passe** : Hachage systématique par sel avec `bcryptjs` ; les empreintes de mots de passe sont exclues des DTO renvoyés aux clients.
- **Authentification sans état (Stateless JWT)** : Jetons sécurisés avec expiration, vérifiés sur chaque route protégée par `authMiddleware`.
- **Intégrité Référentielle** : Blocage des suppressions orphelines et vérification de l'existence des clés étrangères (clients, matériels, utilisateurs).
- **Écritures Atomiques** : La persistance de fichiers JSON utilise un verrou et des écritures synchrones fiables.

---

## ⚙️ Installation & Démarrage

### Prérequis
- **Node.js** : Version 18 ou supérieure recommandée
- **npm** : Version 9 ou supérieure

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancement en mode Développement
Démarre simultanément l'API Express et le serveur de développement Vite sur le port `3000` :
```bash
npm run dev
```
Accédez ensuite à l'application dans votre navigateur : `http://localhost:3000`.

### 3. Compilation et Lancement en Production
```bash
# Compilation du frontend Vite et bundling du serveur Express avec esbuild
npm run build

# Démarrage du serveur Node.js en mode production
npm start
```

### 4. Vérification de la conformité du code
```bash
npm run lint
```

---

## 📄 Références & Fichiers de Spécifications

- **[`cahier_des_charges.txt`](./cahier_des_charges.txt)** : Cahier des charges fonctionnel et technique exhaustif (contexte, objectifs métier, acteurs, règles de gestion, diagrammes UML Use Case, Classes, Séquences et Activités).
- **[`valeurs_test.txt`](./valeurs_test.txt)** : Jeux d'essais rapides pour renseigner instantanément les formulaires lors des phases de démonstration ou d'évaluation.
- **[`metadata.json`](./metadata.json)** : Configuration et métadonnées du projet pour l'environnement AI Studio.
