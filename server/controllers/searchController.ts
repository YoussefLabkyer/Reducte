import { Response, NextFunction } from 'express';
import { SearchService } from '../services/searchService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class SearchController {
  static async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
      const q = (req.query.q as string) || '';
      const results = await SearchService.search(q, req.user.role, req.user.id);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}
