import { Response, NextFunction } from 'express';
import { DemandeService } from '../services/demandeService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ClientModel } from '../models/clientModel.js';

export class DemandeController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const demandes = await DemandeService.getAllDemandes(req.user.role, req.user.id);
      res.json(demandes);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const demande = await DemandeService.getDemandeById(req.params.id, req.user?.role, req.user?.id);
      res.json(demande);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });

      if (req.user.role === 'technicien') {
        return res.status(403).json({ error: 'Les techniciens ne sont pas autorisés à créer des demandes de service.' });
      }

      let clientId = req.body.clientId;
      if (req.user.role === 'client') {
        const client = await ClientModel.findByUserId(req.user.id);
        if (!client) {
          return res.status(400).json({ error: 'Profil client introuvable.' });
        }
        clientId = client.id;
      }

      const result = await DemandeService.createDemande({
        ...req.body,
        clientId
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const demande = await DemandeService.updateDemande(req.params.id, req.body, req.user.role, req.user.id);
      res.json(demande);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const demande = await DemandeService.cancelDemande(req.params.id, req.user.role, req.user.id);
      res.json({ message: 'Demande annulée avec succès.', demande });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const demande = await DemandeService.getDemandeById(req.params.id);
      if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });

      if (req.user.role === 'client') {
        const client = await ClientModel.findByUserId(req.user.id);
        if (!client || client.id !== demande.clientId) {
          return res.status(403).json({ message: 'Non autorisé à supprimer cette demande.' });
        }
      }

      await DemandeService.deleteDemande(req.params.id);
      res.json({ message: 'Demande supprimée avec succès.' });
    } catch (error) {
      next(error);
    }
  }
}
