# 🚀 Reducte — IT Service Management & Maintenance Platform (ITSM)

A full-stack, enterprise-grade web application for **Reducte**, dedicated to centralized IT service management: client accounts, hardware asset tracking, ticketing lifecycle, technician assignments, service resolution, and real-time analytical dashboards.

---

## 📋 Table of Contents
- [Application Overview](#-application-overview)
- [Role-Based Feature Matrix](#-role-based-feature-matrix)
- [Demonstration & Test Accounts](#-demonstration--test-accounts)
- [Technology Stack](#-technology-stack)
- [Project Architecture (MVC)](#-project-architecture-mvc)
- [Installation & Setup](#-installation--setup)
- [Data Structure & Schema](#-data-structure--schema)
- [API Endpoints](#-api-endpoints)
- [Security & Best Practices](#-security--best-practices)
- [Project Documentation & Testing Assets](#-project-documentation--testing-assets)

---

## 🌟 Application Overview

The Reducte ITSM platform streamlines IT operations and support workflows:

1. **Secure Multi-Role Access**: Role-Based Access Control (RBAC) with JWT authentication for **Administrators**, **Technicians**, and **Clients**.
2. **Hardware Asset Management**: Comprehensive tracking of client equipment (category, brand, model, serial number, installation date, and maintenance history).
3. **End-to-End Service Ticketing**: Lifecycle management from ticket creation, triage, and technician assignment to status updates (`Nouvelle`, `Affectée`, `En cours`, `Terminée`, `Annulée`) and technical resolution notes.
4. **Role-Tailored Dashboards**: Real-time KPI indicators, status breakdowns, and activity feeds automatically filtered by user privileges.
5. **Global Search & Filter Engine**: Instant cross-entity search across clients, equipment, tickets, and technicians.

---

## 👥 Role-Based Feature Matrix

| Feature / Module | Administrator | Technician | Client |
| :--- | :---: | :---: | :---: |
| **Self-Registration** | ❌ | ❌ | ✅ (`/inscription`) |
| **Executive Dashboard** | ✅ (Full scope) | ✅ (Assigned only) | ✅ (Owned only) |
| **Client Management (CRUD)** | ✅ Full CRUD | 👁️ Read-only | ❌ |
| **Equipment Inventory** | ✅ Full CRUD | 👁️ Read-only | 👁️ Own Assets |
| **Create Support Ticket** | ✅ Any client | ❌ | ✅ Own Equipment |
| **Technician Assignment** | ✅ | ❌ | ❌ |
| **Update Service Status** | ✅ All statuses | ✅ `En cours` / `Terminée` | ❌ |
| **Technical Resolution Notes** | ✅ | ✅ | ❌ |
| **User Account Management** | ✅ Full CRUD | ❌ | ❌ |
| **Change Password** | ✅ | ✅ | ✅ |

### 👑 Administrator
- Complete control over users, clients, equipment, requests, and services.
- Assigns technicians to requests and manages the entire maintenance workflow.
- Access to high-level operational statistics and system analytics.

### 🛠️ Technician
- Views exclusively assigned intervention requests and related client hardware specs.
- Updates service status to `En cours` during work and `Terminée` upon completion.
- Records technical intervention notes and resolution reports.

### 🏢 Client
- Self-registration on `/inscription` creating both user login credentials and client profile.
- Submits support tickets for assigned equipment.
- Tracks real-time ticket progress and browses company hardware inventory.

---

## 🔑 Demonstration & Test Accounts

Pre-configured demo accounts are available with seeded data:

| Role | Email | Password | User Profile |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@reducte.ma` | `admin123` | Youssef El Amrani (System Administrator) |
| **Technicien** | `tech1@reducte.ma` | `tech123` | Mehdi Alaoui (Senior Network & Hardware Technician) |
| **Technicien** | `tech2@reducte.ma` | `tech123` | Sofia Berrada (Systems & Cloud Technician) |
| **Client** | `contact@alphatech.ma` | `client123` | Karim Benjelloun (Alpha Tech SARL) |
| **Client** | `contact@atlasdigital.ma` | `client123` | Nadia Alami (Atlas Digital SARL) |

> 📌 *Note: Complete copy-paste test inputs for all application forms are documented in `valeurs_test.txt`.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide React (vector icons), React Router v6, Recharts.
- **Backend**: Node.js, Express.js (TypeScript executed via `tsx` in development, bundled with `esbuild` for production).
- **Authentication & Security**: JWT (`jsonwebtoken`), password hashing (`bcryptjs`), custom RBAC middleware, DTO filtering.
- **Data Persistence**: Normalized JSON store layer (`/data/*.json`) with atomic file writes, synchronous integrity, and relational foreign keys.

---

## 📁 Project Architecture (MVC)

```text
├── data/                       # Normalized JSON persistent database
│   ├── utilisateurs.json       # User credentials and RBAC roles
│   ├── clients.json            # Client companies and contact records
│   ├── equipements.json        # Hardware inventory linked to clients
│   ├── demandes.json           # Service requests (tickets)
│   └── services.json           # Technician assignments and resolution notes
│
├── server/                     # Express.js backend (Layered MVC architecture)
│   ├── controllers/            # HTTP request/response handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── clientController.ts
│   │   ├── equipementController.ts
│   │   ├── demandeController.ts
│   │   ├── serviceController.ts
│   │   ├── dashboardController.ts
│   │   └── searchController.ts
│   ├── services/               # Core business logic and RBAC constraints
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── clientService.ts
│   │   ├── equipementService.ts
│   │   ├── demandeService.ts
│   │   ├── serviceService.ts
│   │   ├── dashboardService.ts
│   │   └── searchService.ts
│   ├── models/                 # Data access layer and schema queries
│   │   ├── jsonStore.ts        # Atomic JSON persistence helper
│   │   ├── userModel.ts
│   │   ├── clientModel.ts
│   │   ├── equipementModel.ts
│   │   ├── demandeModel.ts
│   │   └── serviceModel.ts
│   ├── middleware/             # Security, JWT, RBAC, and error handlers
│   │   ├── authMiddleware.ts
│   │   ├── validationMiddleware.ts
│   │   └── errorHandler.ts
│   ├── routes/                 # REST API route definitions (/api/*)
│   └── utils/                  # Data seeding, JWT token utils & password hashing
│
├── src/                        # React Frontend (SPA)
│   ├── components/             # Reusable UI components (Layout, Header, Modals, Pagination)
│   ├── context/                # Global React contexts (AuthContext)
│   ├── pages/                  # Views (Dashboard, Clients, Equipements, Demandes, Services, Users, Login, Register, ChangePassword)
│   ├── services/               # Client-side API HTTP client
│   └── types/                  # Shared TypeScript interfaces & types
│
├── cahier_des_charges_fonctionnel.txt  # Complete functional specification (CDCF)
├── valeurs_test.txt                    # Ready-to-use form test values
├── server.ts                           # Main entry point & Vite middleware setup
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Starts the full-stack server (Express backend + Vite frontend on port `3000`):
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Production Build & Run
```bash
npm run build
npm start
```

---

## 💾 Data Structure & Schema

The application uses normalized relational data models stored in `/data/`:

- **Utilisateurs** (`utilisateurs.json`): `id`, `nom`, `email`, `motDePasse`, `role` (`admin` | `technicien` | `client`), `statut` (`actif` | `inactif`), `dateCreation`.
- **Clients** (`clients.json`): `id`, `userId`, `nom`, `prenom`, `societe`, `adresse`, `telephone`, `email`, `dateCreation`.
- **Équipements** (`equipements.json`): `id`, `clientId`, `nom`, `categorie` (`Serveur` | `PC Fixe` | `PC Portable` | `Réseau` | `Stockage` | `Imprimante` | `Autre`), `marque`, `modele`, `numeroSerie`, `dateInstallation`.
- **Demandes** (`demandes.json`): `id`, `objet`, `description`, `priorite` (`Faible` | `Moyenne` | `Élevée`), `statut` (`Nouvelle` | `Affectée` | `En cours` | `Terminée` | `Annulée`), `clientId`, `equipementId`, `dateCreation`.
- **Services** (`services.json`): `id`, `demandeId`, `technicienId`, `statut` (`Nouvelle` | `Affectée` | `En cours` | `Terminée`), `notes`, `dateAffectation`, `dateMiseAJour`.

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api` and secured with JWT Bearer tokens:

### Authentication & Profile
- `POST /api/auth/login` — Authenticate user and issue JWT token.
- `POST /api/auth/register` — Public client account registration.
- `GET /api/auth/me` — Retrieve current authenticated session info.
- `POST /api/auth/change-password` — Update user password.

### Core Business APIs
- `/api/clients` — Client management (CRUD, search, pagination).
- `/api/equipements` — Equipment catalog (CRUD, filtering by client and category).
- `/api/demandes` — Support ticket management with workflow updates.
- `/api/services` — Intervention assignments, technician task queue, and resolution logs.
- `/api/users` — Administrative user accounts and role configurations.
- `/api/dashboard/stats` — Role-scoped analytics and metrics.
- `/api/search` — Cross-module global search.

---

## 🛡️ Security & Best Practices

- **Strict Role-Based Isolation**: Technicians strictly see assigned tasks; clients strictly access their company's tickets and equipment.
- **Password Security**: Passwords hashed using salted `bcryptjs` routines and excluded from all API output models.
- **Stateless JWT Tokens**: Verified on every protected API call through `authMiddleware`.
- **Input Validation**: Backend validation ensuring schema compliance, email format validity, and data integrity.
- **Relational Integrity**: Deletion guards and cascades preventing orphan tickets or invalid foreign references.

---

## 📄 Project Documentation & Testing Assets

- **`cahier_des_charges_fonctionnel.txt`**: Complete functional specifications (CDCF) detailing modules, workflows, acceptance criteria, and security rules.
- **`valeurs_test.txt`**: Concise, ready-to-copy sample test inputs for all application forms.
