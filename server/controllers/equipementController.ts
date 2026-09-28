import { Response, NextFunction } from 'express';
import { EquipementService } from '../services/equipementService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ClientModel } from '../models/clientModel.js';

export class EquipementController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let clientIdFilter: string | undefined = undefined;

      // If user is a client, restrict to their own equipment
      if (req.user?.role === 'client') {
        const client = await ClientModel.findByUserId(req.user.id);
        if (client) {
          clientIdFilter = client.id;
        } else {
          return res.json([]);
        }
      } else if (req.query.clientId) {
        clientIdFilter = req.query.clientId as string;
      }

      const equipements = await EquipementService.getAllEquipements(clientIdFilter);
      res.json(equipements);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await EquipementService.getEquipementById(req.params.id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let data = { ...req.body };
      if (req.user?.role === 'client') {
        const client = await ClientModel.findByUserId(req.user.id);
        if (client) {
          data.clientId = client.id;
        } else {
          return res.status(400).json({ message: 'Profil client introuvable.' });
        }
      }
      if (!data.clientId) {
        return res.status(400).json({ message: 'Le champ client est obligatoire.' });
      }
      const item = await EquipementService.createEquipement(data);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await EquipementService.updateEquipement(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const item = await EquipementService.getEquipementById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Équipement non trouvé.' });

      if (req.user.role === 'client') {
        const client = await ClientModel.findByUserId(req.user.id);
        if (!client || client.id !== item.clientId) {
          return res.status(403).json({ message: 'Non autorisé à supprimer cet équipement.' });
        }
      }

      await EquipementService.deleteEquipement(req.params.id);
      res.json({ message: 'Équipement supprimé avec succès.' });
    } catch (error) {
      next(error);
    }
  }
}
