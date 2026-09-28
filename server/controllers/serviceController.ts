import { Response, NextFunction } from 'express';
import { ServiceService } from '../services/serviceService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ServiceController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const services = await ServiceService.getAllServices(req.user.role, req.user.id);
      res.json(services);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const service = await ServiceService.getServiceById(req.params.id);
      res.json(service);
    } catch (error) {
      next(error);
    }
  }

  static async assign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { technicienId } = req.body;
      const service = await ServiceService.assignTechnician(req.params.id, technicienId);
      res.json({ message: 'Demande affectée au technicien avec succès.', service });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const { statut, notes } = req.body;
      const service = await ServiceService.updateStatus(req.params.id, statut, notes, req.user.role, req.user.id);
      res.json({ message: 'Statut du service mis à jour avec succès.', service });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ServiceService.deleteService(req.params.id);
      res.json({ message: 'Service supprimé avec succès.' });
    } catch (error) {
      next(error);
    }
  }
}
