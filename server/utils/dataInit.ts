import { UserModel } from '../models/userModel.js';
import { ClientModel } from '../models/clientModel.js';
import { EquipementModel } from '../models/equipementModel.js';
import { DemandeModel } from '../models/demandeModel.js';
import { ServiceModel } from '../models/serviceModel.js';
import { hashPassword } from './password.js';

export async function initializeDataSeed() {
  try {
    const existingUsers = await UserModel.findAll();
    if (existingUsers.length === 0) {
      console.log('Seeding initial data for Reducte IT Service Management...');

      const hashedAdminPassword = await hashPassword('admin123');
      const hashedTechPassword = await hashPassword('tech123');
      const hashedClientPassword = await hashPassword('client123');

      // 1. Create Users
      const adminUser = await UserModel.create({
        id: 'usr-admin-01',
        nom: 'Youssef El Amrani (Admin)',
        email: 'admin@reducte.ma',
        motDePasse: hashedAdminPassword,
        role: 'admin',
        statut: 'Actif',
        dateCreation: new Date().toISOString()
      });

      const techUser = await UserModel.create({
        id: 'usr-tech-01',
        nom: 'Yassine Bennani (Technicien)',
        email: 'tech@reducte.ma',
        motDePasse: hashedTechPassword,
        role: 'technicien',
        statut: 'Actif',
        dateCreation: new Date().toISOString()
      });

      const clientUser = await UserModel.create({
        id: 'usr-client-01',
        nom: 'Amine Mansouri',
        email: 'client@acme.ma',
        motDePasse: hashedClientPassword,
        role: 'client',
        statut: 'Actif',
        dateCreation: new Date().toISOString()
      });

      // 2. Create Clients
      const clientObj1 = await ClientModel.create({
        id: 'cli-01',
        userId: clientUser.id,
        nom: 'Mansouri',
        prenom: 'Amine',
        societe: 'Atlas Tech Solutions',
        adresse: '15 Boulevard Zerktouni, Maarif, Casablanca',
        telephone: '0522304050',
        email: 'client@acme.ma',
        dateCreation: new Date().toISOString()
      });

      const clientObj2 = await ClientModel.create({
        id: 'cli-02',
        nom: 'Alami',
        prenom: 'Sara',
        societe: 'Maroc Logistics',
        adresse: '45 Avenue Fal Ould Oumeir, Agdal, Rabat',
        telephone: '0537708090',
        email: 'sara.alami@maroclogistics.ma',
        dateCreation: new Date().toISOString()
      });

      const clientObj3 = await ClientModel.create({
        id: 'cli-03',
        nom: 'Berrada',
        prenom: 'Karim',
        societe: 'Medina Soft Tanger',
        adresse: '8 Rue de la Kasbah, Tanger',
        telephone: '0539901020',
        email: 'karim.berrada@medinasoft.ma',
        dateCreation: new Date().toISOString()
      });

      // 3. Create Equipements
      const eq1 = await EquipementModel.create({
        id: 'eq-01',
        clientId: clientObj1.id,
        nom: 'Serveur de fichiers principal',
        categorie: 'Serveur',
        marque: 'Dell',
        modele: 'PowerEdge R740',
        numeroSerie: 'SN-DELL-982341',
        dateInstallation: '2024-01-15'
      });

      const eq2 = await EquipementModel.create({
        id: 'eq-02',
        clientId: clientObj2.id,
        nom: 'Switch Réseau Cœur 48P',
        categorie: 'Réseau',
        marque: 'Cisco',
        modele: 'Catalyst 9300',
        numeroSerie: 'SN-CISCO-551029',
        dateInstallation: '2024-05-20'
      });

      const eq3 = await EquipementModel.create({
        id: 'eq-03',
        clientId: clientObj3.id,
        nom: 'Station de Travail Design',
        categorie: 'Ordinateur',
        marque: 'HP',
        modele: 'ZBook Studio G10',
        numeroSerie: 'SN-HP-334112',
        dateInstallation: '2024-09-10'
      });

      // 4. Create Demandes
      const dem1 = await DemandeModel.create({
        id: 'dem-01',
        objet: 'Lenteur d accès au serveur de fichiers',
        description: 'Le serveur de fichiers principal répond très lentement lors de l ouverture de gros dossiers.',
        priorite: 'Élevée',
        dateCreation: new Date().toISOString(),
        clientId: clientObj1.id,
        equipementId: eq1.id,
        statut: 'En cours'
      });

      const dem2 = await DemandeModel.create({
        id: 'dem-02',
        objet: 'Coupure intermittente du réseau local',
        description: 'Le switch principal perd des paquets aux heures de pointe, impactant l agence de Rabat.',
        priorite: 'Élevée',
        dateCreation: new Date().toISOString(),
        clientId: clientObj2.id,
        equipementId: eq2.id,
        statut: 'Affectée'
      });

      const dem3 = await DemandeModel.create({
        id: 'dem-03',
        objet: 'Mise à niveau RAM et nettoyage système',
        description: 'Demande d augmentation de la mémoire vive à 64Go pour la station de rendu graphique.',
        priorite: 'Moyenne',
        dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        clientId: clientObj3.id,
        equipementId: eq3.id,
        statut: 'Terminée'
      });

      // 5. Create Services
      await ServiceModel.create({
        id: 'srv-01',
        demandeId: dem1.id,
        technicienId: techUser.id,
        statut: 'En cours',
        dateAffectation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString(),
        notes: 'Diagnostic en cours sur les disques RAID du serveur de Casablanca.'
      });

      await ServiceModel.create({
        id: 'srv-02',
        demandeId: dem2.id,
        technicienId: techUser.id,
        statut: 'Affectée',
        dateAffectation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString(),
        notes: 'Intervention planifiée sur site à Agdal Rabat.'
      });

      await ServiceModel.create({
        id: 'srv-03',
        demandeId: dem3.id,
        technicienId: techUser.id,
        statut: 'Terminée',
        dateAffectation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dateMiseAJour: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Barrettes RAM 2x16Go installées et validées sous stress test.'
      });

      console.log('Data seed complete! Admin account: admin@reducte.ma / admin123');
    }
  } catch (error) {
    console.error('Error during data initialization:', error);
  }
}
