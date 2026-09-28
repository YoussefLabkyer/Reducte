import { ClientModel } from '../models/clientModel.js';
import { EquipementModel } from '../models/equipementModel.js';
import { DemandeModel } from '../models/demandeModel.js';
import { ServiceModel } from '../models/serviceModel.js';
import { Client } from '../../src/types/index.js';

export class ClientService {
  static async getAllClients(): Promise<Client[]> {
    return ClientModel.findAll();
  }

  static async getClientById(id: string): Promise<Client> {
    const client = await ClientModel.findById(id);
    if (!client) {
      throw { status: 404, message: 'Client non trouvé.' };
    }
    return client;
  }

  static async createClient(data: Omit<Client, 'id' | 'dateCreation'>): Promise<Client> {
    const existing = await ClientModel.findByEmail(data.email);
    if (existing) {
      throw { status: 400, message: 'Un client avec cet e-mail existe déjà.' };
    }

    const newClient: Client = {
      id: 'cli-' + Date.now(),
      ...data,
      dateCreation: new Date().toISOString()
    };

    return ClientModel.create(newClient);
  }

  static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const updated = await ClientModel.update(id, updates);
    if (!updated) {
      throw { status: 404, message: 'Client non trouvé.' };
    }
    return updated;
  }

  static async deleteClient(id: string): Promise<void> {
    const deleted = await ClientModel.delete(id);
    if (!deleted) {
      throw { status: 404, message: 'Client non trouvé.' };
    }

    // Clean up related equipments
    const equipments = await EquipementModel.findByClientId(id);
    for (const eq of equipments) {
      await EquipementModel.delete(eq.id);
    }

    // Clean up related demands and their services
    const allDemandes = await DemandeModel.findAll();
    const related = allDemandes.filter(d => d.clientId === id);
    for (const d of related) {
      await DemandeModel.delete(d.id);
      const srv = await ServiceModel.findByDemandeId(d.id);
      if (srv) {
        await ServiceModel.delete(srv.id);
      }
    }
  }
}
