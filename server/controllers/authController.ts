import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UserModel } from '../models/userModel.js';
import { ClientModel } from '../models/clientModel.js';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerClient(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, motDePasse } = req.body;
      const response = await AuthService.login(email, motDePasse);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié.' });
      }
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const userDto = {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        statut: user.statut,
        dateCreation: user.dateCreation
      };

      let client = undefined;
      if (user.role === 'client') {
        client = await ClientModel.findByUserId(user.id);
      }

      res.json({ user: userDto, client });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié.' });
      }
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
      await AuthService.changePassword(req.user.id, ancienMotDePasse, nouveauMotDePasse);
      res.json({ message: 'Mot de passe modifié avec succès.' });
    } catch (error) {
      next(error);
    }
  }
}
