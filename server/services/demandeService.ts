import { DemandeModel } from '../models/demandeModel.js';
import { ServiceModel } from '../models/serviceModel.js';
import { ClientModel } from '../models/clientModel.js';
import { EquipementModel } from '../models/equipementModel.js';
import { Demande, PriorityLevel } from '../../src/types/index.js';

export class DemandeService {
  static async getAllDemandes(userRole: string, userId: string): Promise<Demande[]> {
    if (userRole === 'client') {
      const client = await ClientModel.findByUserId(userId);
      if (!client) return [];
      return DemandeModel.findByClientId(client.id);
    }
    if (userRole === 'technicien') {
      const assignedServices = await ServiceModel.findByTechnicienId(userId);
      const assignedDemandeIds = new Set(assignedServices.map(s => s.demandeId));
      const all = await DemandeModel.findAll();
      return all.filter(d => assignedDemandeIds.has(d.id));
    }
    return DemandeModel.findAll();
  }

  static async getDemandeById(id: string, userRole?: string, userId?: string): Promise<Demande> {
    const demande = await DemandeModel.findById(id);
    if (!demande) {
      throw { status: 404, message: 'Demande non trouvée.' };
    }
    if (userRole === 'client' && userId) {
      const client = await ClientModel.findByUserId(userId);
      if (!client || client.id !== demande.clientId) {
        throw { status: 403, message: 'Non autorisé à consulter cette demande.' };
      }
    }
    if (userRole === 'technicien' && userId) {
      const service = await ServiceModel.findByDemandeId(id);
      if (!service || service.technicienId !== userId) {
        throw { status: 403, message: 'Non autorisé à consulter cette demande (non affectée).' };
      }
    }
    return demande;
  }

  static async createDemande(data: {
    objet: string;
    description: string;
    priorite: PriorityLevel;
    clientId: string;
    equipementId: string;
  }): Promise<{ demande: Demande; serviceId: string }> {
    const client = await ClientModel.findById(data.clientId);
    if (!client) {
      throw { status: 400, message: 'Client introuvable.' };
    }

    const equipement = await EquipementModel.findById(data.equipementId);
    if (!equipement) {
      throw { status: 400, message: 'Équipement introuvable.' };
    }

    const demandeId = 'dem-' + Date.now();
    const newDemande: Demande = {
      id: demandeId,
      objet: data.objet,
      description: data.description,
      priorite: data.priorite || 'Moyenne',
      dateCreation: new Date().toISOString(),
      clientId: data.clientId,
      equipementId: data.equipementId,
      statut: 'Nouvelle'
    };

    const savedDemande = await DemandeModel.create(newDemande);

    // Create corresponding Service entry
    const serviceId = 'srv-' + Date.now();
    await ServiceModel.create({
      id: serviceId,
      demandeId: savedDemande.id,
      statut: 'Nouvelle',
      dateMiseAJour: new Date().toISOString(),
      notes: 'Demande créée'
    });

    return { demande: savedDemande, serviceId };
  }

  static async updateDemande(id: string, updates: Partial<Demande>, userRole: string, userId: string): Promise<Demande> {
    const existing = await DemandeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Demande non trouvée.' };
    }

    if (userRole === 'client') {
      const client = await ClientModel.findByUserId(userId);
      if (!client || client.id !== existing.clientId) {
        throw { status: 403, message: 'Non autorisé à modifier cette demande.' };
      }
      if (existing.statut !== 'Nouvelle') {
        throw { status: 400, message: 'Impossible de modifier une demande déjà prise en charge.' };
      }
    }

    if (userRole === 'technicien') {
      const service = await ServiceModel.findByDemandeId(id);
      if (!service || service.technicienId !== userId) {
        throw { status: 403, message: 'Non autorisé à modifier une demande qui ne vous est pas affectée.' };
      }

      // Technicians can only change status to 'En cours' or 'Terminée'
      if (!updates.statut || (updates.statut !== 'En cours' && updates.statut !== 'Terminée')) {
        throw { status: 400, message: "Les techniciens peuvent uniquement définir le statut sur 'En cours' ou 'Terminée'." };
      }

      const updated = await DemandeModel.update(id, { statut: updates.statut });
      if (!updated) {
        throw { status: 500, message: 'Erreur lors de la mise à jour de la demande.' };
      }

      // Synchronize associated service status
      await ServiceModel.update(service.id, {
        statut: updates.statut,
        dateMiseAJour: new Date().toISOString()
      });

      return updated;
    }

    const updated = await DemandeModel.update(id, updates);
    if (!updated) {
      throw { status: 404, message: 'Demande non trouvée.' };
    }

    if (updates.statut) {
      const service = await ServiceModel.findByDemandeId(id);
      if (service) {
        await ServiceModel.update(service.id, {
          statut: updates.statut,
          dateMiseAJour: new Date().toISOString()
        });
      }
    }

    return updated;
  }

  static async cancelDemande(id: string, userRole: string, userId: string): Promise<Demande> {
    const existing = await DemandeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Demande non trouvée.' };
    }

    if (userRole === 'technicien') {
      throw { status: 403, message: 'Les techniciens ne sont pas autorisés à annuler des demandes.' };
    }

    if (userRole === 'client') {
      const client = await ClientModel.findByUserId(userId);
      if (!client || client.id !== existing.clientId) {
        throw { status: 403, message: 'Non autorisé à annuler cette demande.' };
      }
    }

    const updated = await DemandeModel.update(id, { statut: 'Annulée' });
    if (!updated) {
      throw { status: 500, message: 'Erreur lors de l annulation.' };
    }

    // Also update associated service status
    const service = await ServiceModel.findByDemandeId(id);
    if (service) {
      await ServiceModel.update(service.id, {
        statut: 'Annulée',
        dateMiseAJour: new Date().toISOString(),
        notes: 'Demande annulée par l utilisateur'
      });
    }

    return updated;
  }

  static async deleteDemande(id: string): Promise<boolean> {
    const deleted = await DemandeModel.delete(id);
    if (!deleted) {
      throw { status: 404, message: 'Demande non trouvée.' };
    }
    // Delete associated service if exists
    const service = await ServiceModel.findByDemandeId(id);
    if (service) {
      await ServiceModel.delete(service.id);
    }
    return true;
  }
}
