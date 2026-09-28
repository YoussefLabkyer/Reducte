import { EquipementModel } from '../models/equipementModel.js';
import { ClientModel } from '../models/clientModel.js';
import { DemandeModel } from '../models/demandeModel.js';
import { ServiceModel } from '../models/serviceModel.js';
import { Equipement } from '../../src/types/index.js';

export class EquipementService {
  static async getAllEquipements(clientId?: string): Promise<Equipement[]> {
    if (clientId) {
      return EquipementModel.findByClientId(clientId);
    }
    return EquipementModel.findAll();
  }

  static async getEquipementById(id: string): Promise<Equipement> {
    const item = await EquipementModel.findById(id);
    if (!item) {
      throw { status: 404, message: 'Équipement non trouvé.' };
    }
    return item;
  }

  static async createEquipement(data: Omit<Equipement, 'id'>): Promise<Equipement> {
    const client = await ClientModel.findById(data.clientId);
    if (!client) {
      throw { status: 400, message: 'Le client spécifié n existe pas.' };
    }

    const newItem: Equipement = {
      id: 'eq-' + Date.now(),
      ...data
    };

    return EquipementModel.create(newItem);
  }

  static async updateEquipement(id: string, updates: Partial<Equipement>): Promise<Equipement> {
    const updated = await EquipementModel.update(id, updates);
    if (!updated) {
      throw { status: 404, message: 'Équipement non trouvé.' };
    }
    return updated;
  }

  static async deleteEquipement(id: string): Promise<void> {
    const deleted = await EquipementModel.delete(id);
    if (!deleted) {
      throw { status: 404, message: 'Équipement non trouvé.' };
    }

    // Clean up related demandes and their services
    const allDemandes = await DemandeModel.findAll();
    const related = allDemandes.filter(d => d.equipementId === id);
    for (const d of related) {
      await DemandeModel.delete(d.id);
      const srv = await ServiceModel.findByDemandeId(d.id);
      if (srv) {
        await ServiceModel.delete(srv.id);
      }
    }
  }
}
