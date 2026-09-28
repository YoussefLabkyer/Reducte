export type UserRole = 'admin' | 'technicien' | 'client';
export type AccountStatus = 'En attente' | 'Actif' | 'Rejeté' | 'Désactivé';
export type PriorityLevel = 'Faible' | 'Moyenne' | 'Élevée';
export type ServiceStatus = 'Nouvelle' | 'Affectée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
  statut: AccountStatus;
  dateCreation: string;
}

export interface UtilisateurDTO {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  statut: AccountStatus;
  dateCreation: string;
}

export interface Client {
  id: string;
  userId?: string;
  nom: string;
  prenom: string;
  societe: string;
  adresse: string;
  telephone: string;
  email: string;
  dateCreation: string;
}

export interface Equipement {
  id: string;
  clientId: string;
  nom: string;
  categorie: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  dateInstallation: string;
}

export interface Demande {
  id: string;
  objet: string;
  description: string;
  priorite: PriorityLevel;
  dateCreation: string;
  clientId: string;
  equipementId: string;
  statut: ServiceStatus;
}

export interface ServiceItem {
  id: string;
  demandeId: string;
  technicienId?: string;
  statut: ServiceStatus;
  dateAffectation?: string;
  dateMiseAJour: string;
  notes?: string;
}

export interface AuthResponse {
  token: string;
  user: UtilisateurDTO;
  client?: Client;
}

export interface DashboardStats {
  nbClients: number;
  nbTechniciens: number;
  nbDemandes: number;
  nbServicesEnCours: number;
  nbServicesTermines: number;
  demandesParStatut?: Record<string, number>;
  demandesParPriorite?: Record<string, number>;
  servicesParStatut?: Record<string, number>;
  dernieresDemandes: (Demande & {
    clientNom?: string;
    equipementNom?: string;
    technicienNom?: string;
    serviceStatut?: string;
    notes?: string;
  })[];
  clientStats?: {
    enAttente: number;
    enCours: number;
    terminees: number;
    annulees: number;
    total: number;
  };
  clientEquipements?: Equipement[];
  derniereDemande?: Demande & {
    clientNom?: string;
    equipementNom?: string;
    technicienNom?: string;
    serviceStatut?: string;
    notes?: string;
  };
}

export interface SearchResults {
  clients: Client[];
  equipements: (Equipement & { clientNom?: string })[];
  demandes: (Demande & { clientNom?: string; equipementNom?: string })[];
  services: (ServiceItem & { objetDemande?: string; technicienNom?: string })[];
}
