import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const stats = await DashboardService.getStats(req.user.role, req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
