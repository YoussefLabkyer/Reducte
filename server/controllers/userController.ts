import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class UserController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getPending(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pending = await UserService.getPendingUsers();
      res.json(pending);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async validate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.validateRegistration(req.params.id);
      res.json({ message: 'Compte client validé et activé avec succès.', user });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.rejectRegistration(req.params.id);
      res.json({ message: 'Demande d inscription rejetée.', user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { statut } = req.body;
      const user = await UserService.toggleUserStatus(req.params.id, statut);
      res.json({ message: `Statut du compte mis à jour: ${statut}`, user });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(req.params.id);
      res.json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
      next(error);
    }
  }
}
