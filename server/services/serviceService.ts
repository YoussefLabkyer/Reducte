import { ServiceModel } from '../models/serviceModel.js';
import { DemandeModel } from '../models/demandeModel.js';
import { ClientModel } from '../models/clientModel.js';
import { UserModel } from '../models/userModel.js';
import { ServiceItem, ServiceStatus } from '../../src/types/index.js';

export class ServiceService {
  static async getAllServices(userRole: string, userId: string): Promise<ServiceItem[]> {
    if (userRole === 'technicien') {
      const all = await ServiceModel.findAll();
      return all.filter(s => Boolean(s.technicienId) && s.technicienId === userId);
    }
    if (userRole === 'client') {
      const client = await ClientModel.findByUserId(userId);
      if (!client) return [];
      const clientDemandes = await DemandeModel.findByClientId(client.id);
      const demandeIds = new Set(clientDemandes.map(d => d.id));
      const all = await ServiceModel.findAll();
      return all.filter(s => demandeIds.has(s.demandeId));
    }
    return ServiceModel.findAll();
  }

  static async getServiceById(id: string): Promise<ServiceItem> {
    const service = await ServiceModel.findById(id);
    if (!service) {
      throw { status: 404, message: 'Service non trouvé.' };
    }
    return service;
  }

  static async assignTechnician(serviceId: string, technicienId: string): Promise<ServiceItem> {
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw { status: 404, message: 'Service non trouvé.' };
    }

    const techUser = await UserModel.findById(technicienId);
    if (!techUser || techUser.role !== 'technicien') {
      throw { status: 400, message: 'L utilisateur sélectionné n est pas un technicien valide.' };
    }

    const updated = await ServiceModel.update(serviceId, {
      technicienId,
      statut: 'Affectée',
      dateAffectation: new Date().toISOString(),
      dateMiseAJour: new Date().toISOString()
    });

    if (!updated) {
      throw { status: 500, message: 'Erreur lors de l affectation.' };
    }

    // Sync status with Demande
    await DemandeModel.update(service.demandeId, { statut: 'Affectée' });

    return updated;
  }

  static async updateStatus(
    serviceId: string,
    statut: ServiceStatus,
    notes?: string,
    userRole?: string,
    userId?: string
  ): Promise<ServiceItem> {
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw { status: 404, message: 'Service non trouvé.' };
    }

    const validStatuses: ServiceStatus[] = ['Nouvelle', 'Affectée', 'En cours', 'Terminée', 'Annulée'];
    if (!validStatuses.includes(statut)) {
      throw { status: 400, message: 'Statut invalide.' };
    }

    if (userRole === 'technicien') {
      if (service.technicienId !== userId) {
        throw { status: 403, message: 'Seul le technicien affecté (ou l administrateur) peut modifier ce service.' };
      }
      if (statut !== 'En cours' && statut !== 'Terminée') {
        throw { status: 400, message: "Les techniciens peuvent uniquement définir le statut sur 'En cours' ou 'Terminée'." };
      }
    }

    const updates: Partial<ServiceItem> = {
      statut,
      dateMiseAJour: new Date().toISOString()
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }

    const updated = await ServiceModel.update(serviceId, updates);
    if (!updated) {
      throw { status: 500, message: 'Erreur lors de la mise à jour du service.' };
    }

    // Sync status with Demande
    await DemandeModel.update(service.demandeId, { statut });

    return updated;
  }

  static async deleteService(id: string): Promise<boolean> {
    const deleted = await ServiceModel.delete(id);
    if (!deleted) {
      throw { status: 404, message: 'Service non trouvé.' };
    }
    return true;
  }
}
