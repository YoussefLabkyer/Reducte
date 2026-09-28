import { ClientModel } from '../models/clientModel.js';
import { UserModel } from '../models/userModel.js';
import { DemandeModel } from '../models/demandeModel.js';
import { ServiceModel } from '../models/serviceModel.js';
import { EquipementModel } from '../models/equipementModel.js';
import { DashboardStats } from '../../src/types/index.js';

export class DashboardService {
  static async getStats(userRole: string, userId: string): Promise<DashboardStats> {
    const clients = await ClientModel.findAll();
    const users = await UserModel.findAll();
    const demandes = await DemandeModel.findAll();
    const services = await ServiceModel.findAll();
    const equipements = await EquipementModel.findAll();

    const techniciens = users.filter(u => u.role === 'technicien');

    // Filter demands and equipements if client role or technician role
    let relevantDemandes = demandes;
    let relevantServices = services;
    let clientEquipements: typeof equipements = [];
    if (userRole === 'client') {
      const client = await ClientModel.findByUserId(userId);
      if (client) {
        relevantDemandes = demandes.filter(d => d.clientId === client.id);
        clientEquipements = equipements.filter(e => e.clientId === client.id);
      } else {
        relevantDemandes = [];
        clientEquipements = [];
      }
    } else if (userRole === 'technicien') {
      relevantServices = services.filter(s => s.technicienId === userId);
      const myDemandeIds = new Set(relevantServices.map(s => s.demandeId));
      relevantDemandes = demandes.filter(d => myDemandeIds.has(d.id));
    }

    const nbServicesEnCours = relevantServices.filter(s => s.statut === 'En cours').length;
    const nbServicesTermines = relevantServices.filter(s => s.statut === 'Terminée').length;

    const demandesParStatut: Record<string, number> = {
      'Nouvelle': relevantDemandes.filter(d => d.statut === 'Nouvelle').length,
      'Affectée': relevantDemandes.filter(d => d.statut === 'Affectée').length,
      'En cours': relevantDemandes.filter(d => d.statut === 'En cours').length,
      'Terminée': relevantDemandes.filter(d => d.statut === 'Terminée').length,
      'Annulée': relevantDemandes.filter(d => d.statut === 'Annulée').length,
    };

    const demandesParPriorite: Record<string, number> = {
      'Faible': relevantDemandes.filter(d => d.priorite === 'Faible').length,
      'Moyenne': relevantDemandes.filter(d => d.priorite === 'Moyenne').length,
      'Élevée': relevantDemandes.filter(d => d.priorite === 'Élevée').length,
    };

    const servicesParStatut: Record<string, number> = {
      'Nouvelle': relevantServices.filter(s => s.statut === 'Nouvelle').length,
      'Affectée': relevantServices.filter(s => s.statut === 'Affectée').length,
      'En cours': relevantServices.filter(s => s.statut === 'En cours').length,
      'Terminée': relevantServices.filter(s => s.statut === 'Terminée').length,
      'Annulée': relevantServices.filter(s => s.statut === 'Annulée').length,
    };

    // Latest 5 demandes enriched with Client, Equipement and Technicien names
    const latestRaw = [...relevantDemandes]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 5);

    const dernieresDemandes = latestRaw.map(d => {
      const clientObj = clients.find(c => c.id === d.clientId);
      const equipObj = equipements.find(e => e.id === d.equipementId);
      const serviceObj = services.find(s => s.demandeId === d.id);
      const techObj = serviceObj?.technicienId ? users.find(u => u.id === serviceObj.technicienId) : null;
      return {
        ...d,
        clientNom: clientObj ? `${clientObj.prenom} ${clientObj.nom} (${clientObj.societe})` : 'Inconnu',
        equipementNom: equipObj ? `${equipObj.nom} (${equipObj.marque} ${equipObj.modele})` : 'Inconnu',
        technicienNom: techObj ? techObj.nom : undefined,
        serviceStatut: serviceObj?.statut,
        notes: serviceObj?.notes
      };
    });

    const derniereDemande = dernieresDemandes.length > 0 ? dernieresDemandes[0] : undefined;

    const clientStats = {
      enAttente: relevantDemandes.filter(d => d.statut === 'Nouvelle' || d.statut === 'Affectée').length,
      enCours: relevantDemandes.filter(d => d.statut === 'En cours').length,
      terminees: relevantDemandes.filter(d => d.statut === 'Terminée').length,
      annulees: relevantDemandes.filter(d => d.statut === 'Annulée').length,
      total: relevantDemandes.length,
    };

    return {
      nbClients: clients.length,
      nbTechniciens: techniciens.length,
      nbDemandes: relevantDemandes.length,
      nbServicesEnCours,
      nbServicesTermines,
      demandesParStatut,
      demandesParPriorite,
      servicesParStatut,
      dernieresDemandes,
      clientStats,
      clientEquipements,
      derniereDemande
    };
  }
}
