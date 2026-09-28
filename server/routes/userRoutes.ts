import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';
import { validateRequiredFields } from '../middleware/validationMiddleware.js';

const router = Router();

// All user management routes require Admin privileges
router.use(authenticateToken, requireRoles('admin'));

router.get('/', UserController.getAll);
router.get('/pending', UserController.getPending);

router.post(
  '/',
  validateRequiredFields(['nom', 'email', 'motDePasse', 'role']),
  UserController.create
);

router.post('/:id/validate', UserController.validate);
router.post('/:id/reject', UserController.reject);

router.put('/:id', UserController.update);
router.put(
  '/:id/status',
  validateRequiredFields(['statut']),
  UserController.toggleStatus
);

router.delete('/:id', UserController.delete);

export default router;
