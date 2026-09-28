import { ClientModel } from '../models/clientModel.js';
import { EquipementModel } from '../models/equipementModel.js';
import { DemandeModel } from '../models/demandeModel.js';
import { ServiceModel } from '../models/serviceModel.js';
import { UserModel } from '../models/userModel.js';
import { SearchResults } from '../../src/types/index.js';

export class SearchService {
  static async search(query: string, userRole: string, userId: string): Promise<SearchResults> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { clients: [], equipements: [], demandes: [], services: [] };
    }

    const allClients = await ClientModel.findAll();
    const allEquipements = await EquipementModel.findAll();
    const allDemandes = await DemandeModel.findAll();
    const allServices = await ServiceModel.findAll();
    const allUsers = await UserModel.findAll();

    let userClientId: string | undefined = undefined;
    if (userRole === 'client') {
      const client = allClients.find(c => c.userId === userId);
      if (client) userClientId = client.id;
    }

    // 1. Clients
    const matchedClients = userRole === 'client'
      ? (userClientId ? allClients.filter(c => c.id === userClientId && matches(c, q)) : [])
      : allClients.filter(c => matches(c, q));

    // 2. Equipements
    const matchedEquipements = allEquipements
      .map(e => {
        const clientObj = allClients.find(c => c.id === e.clientId);
        return {
          ...e,
          clientNom: clientObj ? `${clientObj.prenom} ${clientObj.nom}` : undefined,
          clientSociete: clientObj?.societe
        };
      })
      .filter(e => {
        if (userRole === 'client' && e.clientId !== userClientId) return false;
        return matches(e, q);
      });

    // 3. Demandes
    const matchedDemandes = allDemandes
      .map(d => {
        const clientObj = allClients.find(c => c.id === d.clientId);
        const equipObj = allEquipements.find(e => e.id === d.equipementId);
        return {
          ...d,
          clientNom: clientObj ? `${clientObj.prenom} ${clientObj.nom}` : undefined,
          clientSociete: clientObj?.societe,
          equipementNom: equipObj ? `${equipObj.nom} ${equipObj.numeroSerie}` : undefined
        };
      })
      .filter(d => {
        if (userRole === 'client' && d.clientId !== userClientId) return false;
        if (userRole === 'technicien') {
          const s = allServices.find(srv => srv.demandeId === d.id);
          if (!s || s.technicienId !== userId) return false;
        }
        return matches(d, q);
      });

    // 4. Services
    const matchedServices = allServices
      .map(s => {
        const demandeObj = allDemandes.find(d => d.id === s.demandeId);
        const techObj = allUsers.find(u => u.id === s.technicienId);
        const clientObj = demandeObj ? allClients.find(c => c.id === demandeObj.clientId) : undefined;
        return {
          ...s,
          objetDemande: demandeObj?.objet,
          descriptionDemande: demandeObj?.description,
          technicienNom: techObj?.nom,
          clientSociete: clientObj?.societe
        };
      })
      .filter(s => {
        if (userRole === 'technicien' && s.technicienId !== userId) return false;
        const demandeObj = allDemandes.find(d => d.id === s.demandeId);
        if (userRole === 'client' && demandeObj?.clientId !== userClientId) return false;
        return matches(s, q);
      });

    return {
      clients: matchedClients,
      equipements: matchedEquipements,
      demandes: matchedDemandes,
      services: matchedServices
    };
  }
}

function matches(obj: any, q: string): boolean {
  return Object.values(obj).some(val => {
    if (typeof val === 'string') return val.toLowerCase().includes(q);
    return false;
  });
}
