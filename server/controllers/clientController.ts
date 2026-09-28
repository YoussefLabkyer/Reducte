import { Response, NextFunction } from 'express';
import { ClientService } from '../services/clientService.js';
import { EquipementService } from '../services/equipementService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ClientController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clients = await ClientService.getAllClients();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.getClientById(req.params.id);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  static async getEquipements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const equipements = await EquipementService.getAllEquipements(req.params.id);
      res.json(equipements);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ClientService.deleteClient(req.params.id);
      res.json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
      next(error);
    }
  }
}
