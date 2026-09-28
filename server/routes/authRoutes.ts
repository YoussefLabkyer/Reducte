import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequiredFields } from '../middleware/validationMiddleware.js';

const router = Router();

router.post(
  '/register',
  validateRequiredFields(['nom', 'prenom', 'societe', 'email', 'motDePasse']),
  AuthController.register
);

router.post(
  '/login',
  validateRequiredFields(['email', 'motDePasse']),
  AuthController.login
);

router.get('/me', authenticateToken, AuthController.me);

router.post(
  '/change-password',
  authenticateToken,
  validateRequiredFields(['ancienMotDePasse', 'nouveauMotDePasse']),
  AuthController.changePassword
);

export default router;
